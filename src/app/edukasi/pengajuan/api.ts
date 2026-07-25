import axios from '@/lib/axios';
import { PengajuanForm } from './types';

export const submitPengajuanEdukasi = async (data: PengajuanForm) => {
  const formData = new FormData();
  
  // Append all text fields
  Object.keys(data).forEach((key) => {
    const value = data[key as keyof PengajuanForm];
    if (value !== null && key !== 'dokumen_proposal') {
      formData.append(key, String(value));
    }
  });

  // Append file
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
