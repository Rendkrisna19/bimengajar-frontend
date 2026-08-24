import axios from '@/lib/axios';
import { PengajuanForm } from './types';

export const submitPengajuanEdukasi = async (data: PengajuanForm) => {
  const formData = new FormData();
  
  // Append all text fields
  Object.keys(data).forEach((key) => {
    const value = data[key as keyof PengajuanForm];
    if (value !== null && value !== undefined && key !== 'dokumen_proposal' && key !== 'dokumen_lainnya') {
      formData.append(key, String(value));
    }
  });

  // Map nama_kegiatan to tema_kegiatan for backend compatibility
  if (data.nama_kegiatan && !formData.has('tema_kegiatan')) {
    formData.append('tema_kegiatan', data.nama_kegiatan);
  }

  // Append proposal file
  if (data.dokumen_proposal) {
    formData.append('dokumen_proposal', data.dokumen_proposal);
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await axios.post('/pengajuan-edukasi', formData, {
    withCredentials: false,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
  
  return response.data;
};
