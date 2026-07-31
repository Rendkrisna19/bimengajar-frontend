import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { Pinecone } from '@pinecone-database/pinecone';

// Inisialisasi client OpenAI untuk Groq (menggunakan endpoint kompatibilitas OpenAI dari Groq)
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // 1. Ambil embedding gratis menggunakan HuggingFace
    let vector: number[] = [];
    if (process.env.HF_TOKEN) {
      const embeddingResponse = await fetch(
        'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
          },
          body: JSON.stringify({ inputs: [lastMessage] }),
        }
      );

      const embeddingData = await embeddingResponse.json();
      
      if (embeddingData.error) {
        // Sering terjadi jika model HF sedang "loading" (cold start)
        return new Response(`HuggingFace Error: ${embeddingData.error}. Tunggu sebentar dan coba lagi.`, { status: 503 });
      }
      
      vector = embeddingData[0];
    }

    // 2. Query ke Pinecone Vector Database
    let contextText = "";
    if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME && vector && vector.length > 0) {
      try {
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const index = pc.index(process.env.PINECONE_INDEX_NAME);
        
        const queryResponse = await index.query({
          vector: vector,
          topK: 3,
          includeMetadata: true,
        });

        contextText = queryResponse.matches
          .map((match: any) => match.metadata?.text || '')
          .join('\n\n');
      } catch (error: any) {
        console.error("Pinecone Error:", error);
        return new Response(`Pinecone Error: ${error.message || "Gagal menghubungi database."}`, { status: 500 });
      }
    }

    // 3. Bangun prompt
    const systemPrompt = `Anda adalah Asisten Virtual resmi dari platform "BI Mengajar", sebuah inisiatif dari Bank Indonesia.

ATURAN SANGAT PENTING:
1. Anda HANYA BOLEH menjawab pertanyaan yang berkaitan dengan Bank Indonesia, ekonomi, layanan publik BI, kegiatan edukasi, atau fitur-fitur di website "BI Mengajar".
2. Jika pengguna bertanya tentang topik di luar hal tersebut (contoh: resep masakan, cuaca, politik, game, coding di luar konteks BI), Anda WAJIB MENOLAK menjawabnya dengan sopan dan mengingatkan mereka bahwa Anda hanya asisten untuk platform BI Mengajar.
3. Selalu gunakan nada bahasa yang profesional, ramah, dan informatif ala representasi Bank Indonesia.
4. Gunakan konteks yang diberikan di bawah ini untuk membantu menjawab pertanyaan. Jika jawaban tidak ada di konteks, jawab sesuai dengan pengetahuan umum mengenai Bank Indonesia, namun jangan mengarang informasi yang bersifat rahasia atau spesifik acara jika Anda tidak tahu.

Konteks dari Database:
${contextText ? contextText : "Belum ada dokumen pendukung di database saat ini."}
`;

    if (!process.env.GROQ_API_KEY) {
      return new Response("Groq API Key belum diatur di .env", { status: 500 });
    }

    // 4. Stream response
    const result = await streamText({
      model: groq('llama3-8b-8192'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(`Server Error: ${error.message || "Terjadi kesalahan pada server"}`, { status: 500 });
  }
}
