export interface PengajuanForm {
  jenis_pengajuan: 'mengunjungi' | 'dikunjungi';
  jenis_instansi: string;
  nama_instansi: string;
  alamat_instansi: string;
  nama_pic: string;
  jabatan_pic: string;
  email_pic: string;
  no_telp_pic: string;
  tema_kegiatan: string;
  deskripsi_kegiatan: string;
  jumlah_peserta: number | '';
  tanggal_kegiatan: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi_kegiatan: string;
  dokumen_proposal: File | null;
}
