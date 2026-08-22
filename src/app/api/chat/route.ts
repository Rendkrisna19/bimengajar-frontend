export const maxDuration = 30;

// Knowledge Base Dictionary for Local BI Assistant Engine
const KNOWLEDGE_BASE = [
  {
    category: 'greetings',
    keywords: [
      'halo', 'hai', 'hay', 'hallo', 'hello', 'pagi', 'selamat pagi',
      'siang', 'selamat siang', 'sore', 'selamat sore', 'malam', 'selamat malam',
      'assalamualaikum', 'assalam', 'p', 'ping', 'permisi', 'tes', 'test'
    ],
    exactMatch: true,
    response: `Halo! Selamat datang di **BI Assistant** 🏛️

Saya adalah asisten virtual resmi platform **BI Mengajar** (Bank Indonesia). Ada yang bisa saya bantu hari ini? 

Anda dapat menanyakan informasi seputar:
• **Program BI Mengajar & Pengajuan Kegiatan**
• **Layanan Kas Titik Temu & Penukaran Uang**
• **Edukasi & Tips Merawat Uang Rupiah (CBP)**
• **Tugas & Kebijakan Bank Indonesia (QRIS, Moneter)**`
  },
  {
    category: 'bi_mengajar',
    keywords: ['bi mengajar', 'mengajar', 'program bi mengajar', 'tentang bi mengajar', 'apa itu bi mengajar'],
    response: `**BI Mengajar** adalah program edukasi dan literasi kebanksentralan yang diprakarsai oleh Bank Indonesia untuk meningkatkan pemahaman masyarakat, pelajar, mahasiswa, dan tenaga pendidik mengenai peran, tugas, serta kebijakan Bank Indonesia.

**Fokus Utama Program:**
• **Edukasi Kebanksentralan**: Memahami peran BI dalam menjaga kestabilan nilai Rupiah.
• **Literasi Rupiah (CBP)**: Menanamkan sikap Cinta, Bangga, dan Paham Rupiah.
• **Sistem Pembayaran Digital**: Edukasi penggunaan QRIS dan BI-FAST.
• **Pengajuan Kegiatan**: Fasilitasi narasumber resmi Bank Indonesia untuk kegiatan edukasi di sekolah/instansi Anda.`
  },
  {
    category: 'pengajuan',
    keywords: ['pengajuan', 'daftar', 'pendaftaran', 'cara daftar', 'form pengajuan', 'mengajukan', 'syarat pengajuan', 'alur pengajuan', 'kegiatan'],
    response: `Berikut adalah tata cara dan alur **Pengajuan Kegiatan BI Mengajar**:

**1. Pengisian Formulir Online:**
Buka menu **"Pengajuan Kegiatan"** pada bagian navigasi atas web, lalu isi data instansi/lembaga, lokasi, tanggal kegiatan, serta estimasi jumlah peserta.

**2. Verifikasi Berkas:**
Tim Bank Indonesia akan melakukan verifikasi data dan ketersediaan narasumber sesuai jadwal pengajuan.

**3. Konfirmasi & Persetujuan:**
Status pengajuan dapat dipantau langsung pada halaman **Aktivitas Saya / Riwayat Pengajuan**.

**4. Pelaksanaan Kegiatan:**
Setelah disetujui, narasumber resmi dari Kantor Perwakilan Bank Indonesia akan hadir memberikan materi edukasi.`
  },
  {
    category: 'titik_temu',
    keywords: ['titik temu', 'penukaran uang', 'tukar uang', 'kas keliling', 'uang rusak', 'uang lusuh', 'layanan kas', 'lokasi penukaran'],
    response: `**Titik Temu** adalah fitur layanan informasi lokasi dan jadwal **Kas Keliling Bank Indonesia** untuk memudahkan masyarakat melakukan penukaran uang Rupiah.

**Layanan yang Disediakan:**
• **Penukaran Uang Lusuh / Cacat / Rusak**: Uang yang memenuhi kriteria dapat ditukar dengan uang layak edar bernilai sama.
• **Penukaran Pecahan Kecil**: Penyediaan Uang Layak Edar (ULE) pecahan kecil.
• **Pendaftaran Online (PINTAR)**: Memilih lokasi dan jadwal layanan Kas Keliling terdekat dari lokasi Anda.`
  },
  {
    category: 'merawat_rupiah',
    keywords: ['merawat rupiah', 'tips merawat rupiah', '5 jangan', 'rawat rupiah', 'menjaga rupiah', 'memelihara rupiah', 'merawat uang'],
    response: `Mari jaga keutuhan dan kelayakan uang Rupiah kita dengan menerapkan prinsip **5 Jangan**:

1. **Jangan Dilipat**: Simpan uang secara lurus di dalam dompet.
2. **Jangan Diremas**: Hindari meremas uang kertas agar serat kertas tidak rusak.
3. **Jangan Dicoret**: Dilarang menulis, menggambar, atau menstempel uang Rupiah.
4. **Jangan Distapler**: Hindari menyatukan uang menggunakan klip stapler.
5. **Jangan Dibasahi**: Hindari membasahi atau mencuci uang kertas.

*Merawat Rupiah dengan baik akan memudahkan identifikasi keaslian dan memperpanjang masa edar uang di masyarakat!*`
  },
  {
    category: 'cbp_rupiah',
    keywords: ['cbp', 'cinta bangga paham', '3d', 'keaslian', 'dilihat diterawang', 'diteraba', 'ciri keaslian', 'paham rupiah', 'cinta rupiah', 'bangga rupiah'],
    response: `Gerakan **Cinta, Bangga, Paham (CBP) Rupiah** adalah wujud apresiasi masyarakat terhadap mata uang NKRI:

• **Cinta Rupiah**: Mengenali keaslian uang melalui metode **3D** (**Dilihat** warna & benang pengaman, **Diteraba** tekstur cetak kasar, **Diterawang** tanda air/watermark).
• **Bangga Rupiah**: Menggunakan Rupiah sebagai satu-satunya simbol kedaulatan dan alat pembayaran sah di wilayah NKRI.
• **Paham Rupiah**: Menggunakan Rupiah secara bijak untuk bertransaksi, berbelanja produk dalam negeri, dan berinvestasi.`
  },
  {
    category: 'bank_indonesia',
    keywords: ['bank indonesia', 'tugas bi', 'tujuan bi', 'moneter', 'qris', 'bi-fast', 'bifast', 'sistem pembayaran', 'kebijakan bi', 'peran bi'],
    response: `**Bank Indonesia (BI)** adalah Bank Sentral Republik Indonesia yang independen.

**Tujuan Utama:**
Menjaga dan memelihara kestabilan nilai Rupiah (terhadap barang/jasa serta mata uang negara lain).

**Tiga Pilar Utama BI:**
1. **Kebijakan Moneter**: Menjaga laju inflasi dan stabilitas ekonomi nasional.
2. **Stabilitas Sistem Keuangan**: Mengawasi dan menjaga keandalan perbankan & pasar keuangan.
3. **Sistem Pembayaran**: Mengembangkan inovasi pembayaran digital nasional seperti **QRIS** (Quick Response Code Indonesian Standard) dan **BI-FAST** (transfer antarbank murah & realtime 24/7).`
  }
];

const DEFAULT_OUT_OF_CONTEXT_RESPONSE = `Maaf, saya adalah **BI Assistant** yang khusus didesain untuk memberikan informasi seputar program **BI Mengajar**, edukasi **Rupiah**, layanan **Titik Temu**, dan kebanksentralan **Bank Indonesia**.

Pertanyaan Anda di luar ruang lingkup informasi tersebut. Ada yang bisa saya bantu terkait topik Bank Indonesia atau BI Mengajar? 🏛️`;

function findBestResponse(userText: string): string {
  const normalized = userText.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

  // Check greetings first
  const greetingEntry = KNOWLEDGE_BASE.find(k => k.category === 'greetings');
  if (greetingEntry) {
    const isGreeting = greetingEntry.keywords.some(kw => normalized === kw || normalized.startsWith(kw + " ") || normalized.endsWith(" " + kw));
    if (isGreeting) {
      return greetingEntry.response;
    }
  }

  // Check other knowledge base entries
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.category === 'greetings') continue;
    const matched = entry.keywords.some(kw => normalized.includes(kw));
    if (matched) {
      return entry.response;
    }
  }

  return DEFAULT_OUT_OF_CONTEXT_RESPONSE;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    
    // Get last user message
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
    const userText = lastUserMsg ? (typeof lastUserMsg.content === 'string' ? lastUserMsg.content : JSON.stringify(lastUserMsg.content)) : '';

    const answer = findBestResponse(userText);

    // Format as Vercel AI SDK Data Stream protocol chunk for smooth UI streaming
    const payload = `0:${JSON.stringify(answer)}\n`;
    
    return new Response(payload, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1',
      },
    });
  } catch (error: any) {
    console.error('[AI Chatbot Local Engine] Error:', error);
    const fallbackPayload = `0:${JSON.stringify(DEFAULT_OUT_OF_CONTEXT_RESPONSE)}\n`;
    return new Response(fallbackPayload, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1',
      },
    });
  }
}