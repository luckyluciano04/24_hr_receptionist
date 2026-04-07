import OpenAI from 'openai';

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }
  return new OpenAI({ apiKey: key, timeout: 30_000 });
}

let _openai: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_openai) _openai = getOpenAI();
  return _openai;
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export function buildSystemPrompt(businessName: string): string {
  return `You are a professional receptionist for ${businessName}. 
Be warm, helpful, and concise. 
Collect the caller's name and the reason for their call. 
Do not make appointments or commitments. 
Let them know ${businessName} will get back to them shortly. 
Keep the conversation brief — under 2 minutes if possible.`;
}

function parseJsonObject(content: string): Record<string, unknown> | null {
  const trimmed = content.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function generateCallSummary(transcript: string): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          "You are a helpful assistant. Summarize the following call transcript in 2-3 sentences, highlighting the caller's name and reason for calling.",
      },
      { role: 'user', content: transcript },
    ],
    max_tokens: 150,
  });

  return response.choices[0]?.message?.content ?? 'No summary available';
}

export type Intent = 'book' | 'lead' | 'faq' | 'escalate';

export interface IntentAnalysis {
  response: string;
  intent: Intent;
  confidence: number;
}

/**
 * Analyze a caller transcript and return structured intent data.
 * Used by downstream tool-routing logic (booking, CRM, FAQ, escalation).
 */
export async function analyzeIntent(transcript: string, businessName: string): Promise<IntentAnalysis> {
  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an intent classifier for ${businessName}.
Analyze the caller's transcript and return a JSON object with exactly these fields:
- "response": a short, friendly response to give the caller (1-2 sentences)
- "intent": one of "book" | "lead" | "faq" | "escalate"
- "confidence": a number between 0 and 1

Intent definitions:
- book: caller wants to schedule an appointment
- lead: caller is a potential customer inquiring about services
- faq: caller has a general question that can be answered from knowledge base
- escalate: caller needs to speak to a human immediately`,
      },
      { role: 'user', content: transcript },
    ],
    max_tokens: 200,
  });

  try {
    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw) as Partial<IntentAnalysis>;
    return {
      response: parsed.response ?? '',
      intent: (['book', 'lead', 'faq', 'escalate'].includes(parsed.intent ?? '') ? parsed.intent : 'lead') as Intent,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    };
  } catch {
    return { response: '', intent: 'lead', confidence: 0.5 };
  }
}

export async function transcribeAudio(file: File): Promise<string> {
  const response = await getClient().audio.transcriptions.create({
    file,
    model: 'whisper-1',
  });

  return response.text.trim();
}

export async function generateCallInsights(
  transcript: string,
): Promise<{ callerName: string; summary: string }> {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Extract the caller name and write a concise 2-3 sentence summary. Return valid JSON only with keys callerName and summary. Use "Unknown Caller" when the name is not stated.',
      },
      { role: 'user', content: transcript },
    ],
    max_tokens: 200,
  });

  const content = response.choices[0]?.message?.content ?? '';
  const parsed = parseJsonObject(content);

  if (parsed) {
    const callerName =
      typeof parsed.callerName === 'string' && parsed.callerName.trim()
        ? parsed.callerName.trim()
        : 'Unknown Caller';
    const summary =
      typeof parsed.summary === 'string' && parsed.summary.trim()
        ? parsed.summary.trim()
        : await generateCallSummary(transcript);

    return { callerName, summary };
  }

  return {
    callerName: 'Unknown Caller',
    summary: await generateCallSummary(transcript),
  };
}
