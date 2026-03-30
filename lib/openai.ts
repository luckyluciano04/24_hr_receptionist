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
