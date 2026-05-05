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
