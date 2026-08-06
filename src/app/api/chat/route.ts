import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Inisialisasi client OpenAI untuk Groq (menggunakan endpoint kompatibilitas OpenAI dari Groq)
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return new Response("GROQ_API_KEY belum diatur di file .env.local", { status: 500 });
    }

    // Comprehensive Knowledge Base untuk Bank Indonesia & BI Mengajar
    const systemPrompt = `Anda adalah "BI Assistant", Asisten Virtual AI resmi dari platform "BI Mengajar" yang diprakarsai oleh Bank Indonesia (BI).

INFORMASI UTAMA PLATFORM BI MENGAJAR:
- **Pengertian BI Mengajar**: Program edukasi dan literasi kebanksentralan dari Bank Indonesia untuk mengedukasi masyarakat, pelajar, mahasiswa, dan pendidik tentang peran BI, kebijakan moneter, sistem pembayaran, serta pengenalan Rupiah.
- **Fitur Utama Platform**:
  1. **Edukasi & Pengajuan Kegiatan**: Fasilitas bagi sekolah/instansi untuk mengajukan permohonan kunjungan dari BI (Ingin Dikunjungi BI) atau melakukan kunjungan ke Kantor Bank Indonesia (Ingin Mengunjungi BI).
  2. **Titik Temu**: Layanan informasi dan lokasi penukaran uang Rupiah koin/layanan kas keliling BI terdekat.
  3. **Materi & Aktivitas**: Koleksi artikel edukasi, berita terbaru seputar kebijakan ekonomi, dokumentasi kegiatan, serta kalender agenda program.
  4. **Ulasan**: Wadah bagi peserta/masyarakat untuk memberikan respon dan rating pengalaman mengikuti kegiatan BI Mengajar.

PENGETAHUAN KEBANKSENTRALAN (BANK INDONESIA):
- **Tujuan Utama BI**: Mencapai dan memelihara kestabilan nilai Rupiah (terhadap barang/jasa dan mata uang negara lain).
- **Tiga Pilar BI**:
  1. Menetapkan dan melaksanakan kebijakan moneter.
  2. Mengatur dan menjaga kelancaran sistem pembayaran (termasuk QRIS, BI-FAST, Rupiah Digital).
  3. Menjaga stabilitas sistem keuangan (SSK).
- **Gerakan Cinta, Bangga, Paham (CBP) Rupiah**:
  - **Cinta**: Mengenali keaslian (3D: Dilihat, Diterawang, Diteraba) dan merawat Rupiah (5M: Jangan Dilipat, Diremas, Dicoret, Dibereskan/Dibasahi, Distapler).
  - **Bangga**: Rupiah sebagai simbol kedaulatan NKRI dan pemersatu bangsa.
  - **Paham**: Bertransaksi secara bijak, berhemat, dan berinvestasi untuk stabilitas ekonomi.

ATURAN DAN INSTRUKSI JAWABAN:
1. Jawablah pertanyaan pengguna dengan bahasa Indonesia yang ramah, sopan, komunikatif, profesional, dan mudah dipahami.
2. HANYA jawab pertanyaan yang berkaitan dengan Bank Indonesia, ekonomi, Rupiah, sistem pembayaran, kebijakan moneter, atau fitur-fitur platform BI Mengajar.
3. Jika pengguna bertanya di luar topik tersebut (seperti resep masakan, game, politik luar negeri, coding non-BI), tolak dengan halus dan ingatkan bahwa Anda adalah BI Assistant yang berfokus pada edukasi Bank Indonesia.
4. Gunakan format markdown (bullet point, bold) jika jawaban memerlukan rincian agar mudah dibaca.`;

    const modelMessages = await convertToModelMessages(messages || []);

    // Stream response menggunakan model Groq Llama 3.3 70B (super cepat & akurat)
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: (err) => {
          console.error("Stream Error:", err);
          return typeof err === 'string' ? err : (err as Error)?.message || 'Stream error';
        }
      }),
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(`Server Error: ${error.message || "Terjadi kesalahan pada server AI"}`, { status: 500 });
  }
}
