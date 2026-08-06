import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, targetLang = 'EN' } = await req.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      return new Response(JSON.stringify({ translatedText: text || '' }), { status: 200 });
    }

    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ translatedText: text }), { status: 200 });
    }

    const { text: result } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `Translate the following Indonesian text into natural, professional English. Output ONLY the translated English text, without quotes or additional commentary:\n\n${text}`,
    });

    return new Response(JSON.stringify({ translatedText: result.trim() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Translate API error:', error);
    return new Response(JSON.stringify({ translatedText: text }), { status: 500 });
  }
}
