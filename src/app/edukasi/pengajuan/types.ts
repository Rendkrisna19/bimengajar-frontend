export interface PengajuanForm {
  jenis_pengajuan: 'mengunjungi' | 'dikunjungi';
  nama_kegiatan: string;
  tujuan_kegiatan: string;
  jumlah_peserta: number | '';
  deskripsi_kegiatan: string;
  tanggal_kegiatan: string;
  waktu_pelaksanaan: string;
  durasi: string;
  kota_kabupaten: string;
  lokasi_kegiatan: string;
  
  // Data Pemohon / Instansi
  nama_pic: string;
  jabatan_pic: string;
  jenis_instansi: string;
  nama_instansi: string;
  alamat_instansi: string;
  email_pic: string;
  no_telp_pic: string;

  // Dokumen
  dokumen_proposal: File | null;
  dokumen_lainnya?: File | null;
}
