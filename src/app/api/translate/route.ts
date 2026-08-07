import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  let reqText = '';
  try {
    const body = await req.json();
    reqText = body.text || '';

    if (!reqText || typeof reqText !== 'string' || !reqText.trim()) {
      return new Response(JSON.stringify({ translatedText: reqText }), { status: 200 });
    }

    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ translatedText: reqText }), { status: 200 });
    }

    const { text: result } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `Translate the following Indonesian text into natural, professional English. Output ONLY the translated English text, without quotes or additional commentary:\n\n${reqText}`,
    });

    return new Response(JSON.stringify({ translatedText: result.trim() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Translate API error:', error);
    return new Response(JSON.stringify({ translatedText: reqText }), { status: 500 });
  }
}
