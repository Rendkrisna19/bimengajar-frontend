export interface KategoriMateri {
  id: number;
  nama: string;
  slug: string;
  logo?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MateriEdukasi {
  id: number;
  kategori_materi_id: number;
  judul: string;
  slug: string;
  deskripsi_singkat?: string;
  jenis_konten: 'Artikel' | 'Infografis' | 'Video' | 'E-Book' | 'Presentasi';
  thumbnail?: string;
  images?: string[];
  file_path?: string;
  link_eksternal?: string;
  link_youtube?: string[];
  link_drive?: string[];
  konten_teks?: string;
  kategori?: KategoriMateri;
  created_at?: string;
  updated_at?: string;
}
