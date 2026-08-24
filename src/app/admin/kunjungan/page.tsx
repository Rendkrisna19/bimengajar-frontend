'use client';

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Pengajuan {
  id: number;
  user_id: number;
  jenis_pengajuan: string;
  jenis_instansi: string;
  nama_instansi: string;
  alamat_instansi: string;
  nama_pic: string;
  jabatan_pic: string;
  email_pic: string;
  no_telp_pic: string;
  tema_kegiatan: string;
  tujuan_kegiatan?: string;
  deskripsi_kegiatan: string;
  jumlah_peserta: number;
  tanggal_kegiatan: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  waktu_pelaksanaan?: string;
  durasi?: string;
  kota_kabupaten?: string;
  lokasi_kegiatan: string;
  dokumen_proposal: string;
  catatan_tambahan?: string;
  status: string;
  catatan_admin?: string;
  created_at: string;
  user?: User;
}

export default function AdminPengajuanEdukasiPage() {
  const [data, setData] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mengunjungi' | 'dikunjungi'>('mengunjungi');
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState<Pengajuan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/pengajuan-edukasi`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await res.json();
      if (res.ok) {
        setData(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: number, currentStatus: string, newStatus: string) => {
    if (currentStatus === newStatus) return;

    const { value: catatan, isConfirmed } = await Swal.fire({
      title: `Ubah Status ke ${newStatus.toUpperCase()}?`,
      text: 'Tambahkan catatan / pesan untuk pemohon (opsional):',
      input: 'textarea',
      inputPlaceholder: 'Tuliskan catatan, jadwal, atau alasan jika ditolak...',
      inputValue: selectedItem?.catatan_admin || '',
      showCancelButton: true,
      confirmButtonColor: '#003366',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan & Kirim Email',
      cancelButtonText: 'Batal'
    });

    if (isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'}/pengajuan-edukasi/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            status: newStatus,
            catatan_admin: catatan || null
          })
        });

        if (res.ok) {
          const result = await res.json();
          Swal.fire('Berhasil!', 'Status pengajuan berhasil diperbarui dan notifikasi email telah dikirim ke pemohon.', 'success');
          if (selectedItem && selectedItem.id === id) {
            setSelectedItem(result.data || { ...selectedItem, status: newStatus, catatan_admin: catatan });
          }
          fetchData();
        } else {
          Swal.fire('Gagal!', 'Terjadi kesalahan saat memperbarui status.', 'error');
        }
      } catch (error) {
        Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800/50';
      case 'verifikasi': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      case 'penjadwalan': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
      case 'konfirmasi': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50';
      case 'disetujui': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50';
      case 'selesai': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800/50';
      case 'ditolak': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const openModal = (item: Pengajuan) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kelola Kunjungan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Lihat, verifikasi, dan kelola kunjungan kegiatan edukasi dari masyarakat.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('mengunjungi')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'mengunjungi' 
              ? 'border-primary text-primary dark:text-blue-400 dark:border-blue-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <i className="fa-solid fa-building mr-2"></i> Mengunjungi BI
        </button>
        <button
          onClick={() => setActiveTab('dikunjungi')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'dikunjungi' 
              ? 'border-primary text-primary dark:text-blue-400 dark:border-blue-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <i className="fa-solid fa-users mr-2"></i> Dikunjungi BI
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Cari pengajuan..." 
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#1e1e1e] w-64 focus:outline-none focus:border-primary"
            />
          </div>
          <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#1e1e1e] focus:outline-none focus:border-primary text-gray-600 dark:text-gray-300">
            <option>Semua Status</option>
            <option>Pending</option>
            <option>Disetujui</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Tampilkan 
          <select className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-[#1e1e1e] outline-none">
            <option>5</option>
            <option>10</option>
            <option>50</option>
          </select> 
          baris
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white text-[13px] tracking-wide">
                <th className="py-4 px-5 font-semibold text-center w-16">No.</th>
                <th className="py-4 px-5 font-semibold">Tgl Pengajuan <i className="fa-solid fa-arrows-up-down text-[10px] ml-1 opacity-50"></i></th>
                <th className="py-4 px-5 font-semibold">Instansi & PIC <i className="fa-solid fa-arrows-up-down text-[10px] ml-1 opacity-50"></i></th>
                <th className="py-4 px-5 font-semibold">Kota / Kabupaten <i className="fa-solid fa-arrows-up-down text-[10px] ml-1 opacity-50"></i></th>
                <th className="py-4 px-5 font-semibold">Tema Kegiatan <i className="fa-solid fa-arrows-up-down text-[10px] ml-1 opacity-50"></i></th>
                <th className="py-4 px-5 font-semibold text-center">Status</th>
                <th className="py-4 px-5 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-[13px] divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <i className="fa-solid fa-circle-notch animate-spin text-2xl text-primary mb-2"></i>
                    <p>Memuat data...</p>
                  </td>
                </tr>
              ) : data.filter(item => item.jenis_pengajuan === activeTab).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fa-solid fa-folder-open text-2xl text-gray-400"></i>
                    </div>
                    <p>Belum ada data pengajuan untuk kategori ini.</p>
                  </td>
                </tr>
              ) : (
                data.filter(item => item.jenis_pengajuan === activeTab).map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors text-gray-700 dark:text-gray-300">
                    <td className="py-4 px-5 align-top text-center font-medium text-gray-500">
                      {index + 1}
                    </td>
                    <td className="py-4 px-5 align-top">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wide">{item.user?.name || 'Anonim'}</p>
                    </td>
                    <td className="py-4 px-5 align-top">
                      <p className="font-bold text-gray-800 dark:text-white">{item.nama_instansi}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-[10px] font-bold uppercase border border-gray-200 dark:border-gray-700">{item.jenis_instansi}</span>
                        <span className="text-xs text-gray-500"><i className="fa-solid fa-user-tie"></i> {item.nama_pic}</span>
                      </div>
                      {item.email_pic && (
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                          <i className="fa-regular fa-envelope text-[10px]"></i> {item.email_pic}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-5 align-top">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-800/40">
                        <i className="fa-solid fa-location-dot text-[11px] text-red-500"></i>
                        <span>{item.kota_kabupaten || 'Belum diisi'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-5 align-top max-w-[180px]">
                      <p className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2" title={item.tema_kegiatan}>{item.tema_kegiatan}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <i className="fa-regular fa-calendar text-[10px]"></i> {new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID')}
                      </p>
                    </td>
                    <td className="py-4 px-5 align-top text-center">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-sm ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 align-top text-center">
                      <button 
                        onClick={() => openModal(item)}
                        className="w-8 h-8 rounded bg-blue-50 text-primary hover:bg-primary hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-primary dark:hover:text-white transition-colors flex items-center justify-center mx-auto shadow-sm"
                        title="Lihat Detail Lengkap"
                      >
                        <i className="fa-solid fa-eye text-sm"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-[#1e1e1e] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-800/20">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Detail Pengajuan Edukasi</h3>
                <p className="text-xs text-gray-500 mt-1">ID Pengajuan: #{selectedItem.id}</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 dark:bg-gray-800 dark:hover:bg-red-900/30 transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              
              {/* Status Badge */}
              <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Status Saat Ini:</span>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusBadge(selectedItem.status)}`}>
                  {selectedItem.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1 */}
                <div className="flex flex-col gap-6">
                  
                  <div>
                    <h4 className="text-sm font-bold text-primary dark:text-blue-400 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2 uppercase tracking-wider">
                      <i className="fa-solid fa-building mr-2"></i> Informasi Instansi
                    </h4>
                    <div className="flex flex-col gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Jenis Instansi</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedItem.jenis_instansi}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Nama Instansi</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedItem.nama_instansi}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Alamat Lengkap</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">{selectedItem.alamat_instansi}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-primary dark:text-blue-400 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2 uppercase tracking-wider">
                      <i className="fa-solid fa-user-tie mr-2"></i> Penanggung Jawab (PIC)
                    </h4>
                    <div className="flex flex-col gap-3 text-sm bg-blue-50/70 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      <div>
                        <p className="text-blue-600/70 dark:text-blue-400/70 text-xs mb-0.5">Nama PIC & Jabatan</p>
                        <p className="font-bold text-blue-900 dark:text-blue-100">{selectedItem.nama_pic} {selectedItem.jabatan_pic ? `(${selectedItem.jabatan_pic})` : ''}</p>
                      </div>

                      {/* Email PIC */}
                      <div>
                        <p className="text-blue-600/70 dark:text-blue-400/70 text-xs mb-0.5">Email PIC / Instansi</p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-blue-900 dark:text-blue-100 break-all">{selectedItem.email_pic || selectedItem.user?.email || '-'}</p>
                          {(selectedItem.email_pic || selectedItem.user?.email) && (
                            <a 
                              href={`mailto:${selectedItem.email_pic || selectedItem.user?.email}`} 
                              className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shrink-0" 
                              title="Kirim Email"
                            >
                              <i className="fa-regular fa-envelope text-xs"></i>
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-blue-600/70 dark:text-blue-400/70 text-xs mb-0.5">No WhatsApp / Telepon</p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-blue-900 dark:text-blue-100">{selectedItem.no_telp_pic || '-'}</p>
                          {selectedItem.no_telp_pic && (
                            <a href={`https://wa.me/${selectedItem.no_telp_pic.replace(/\D/g,'').replace(/^0/,'62')}`} target="_blank" rel="noreferrer" className="w-6 h-6 rounded bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors shrink-0" title="Hubungi via WA">
                              <i className="fa-brands fa-whatsapp"></i>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-6">
                  
                  <div>
                    <h4 className="text-sm font-bold text-primary dark:text-blue-400 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2 uppercase tracking-wider">
                      <i className="fa-solid fa-calendar-star mr-2"></i> Detail Kegiatan
                    </h4>
                    <div className="flex flex-col gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Nama / Tema Kegiatan</p>
                        <p className="font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">{selectedItem.tema_kegiatan}</p>
                      </div>

                      {selectedItem.tujuan_kegiatan && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Tujuan Kegiatan</p>
                          <p className="font-medium text-gray-700 dark:text-gray-300 text-xs bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 leading-relaxed">{selectedItem.tujuan_kegiatan}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Deskripsi Kegiatan</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">{selectedItem.deskripsi_kegiatan}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Jumlah Peserta</p>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{selectedItem.jumlah_peserta} Orang</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Tanggal</p>
                          <p className="font-bold text-gray-800 dark:text-gray-200"><i className="fa-regular fa-calendar mr-1 text-primary"></i> {new Date(selectedItem.tanggal_kegiatan).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Waktu & Durasi</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                          <i className="fa-regular fa-clock mr-1 text-primary"></i> 
                          {selectedItem.waktu_pelaksanaan || `${selectedItem.waktu_mulai || ''} - ${selectedItem.waktu_selesai || ''}`} 
                          {selectedItem.durasi ? ` (${selectedItem.durasi})` : ''}
                        </p>
                      </div>

                      {/* Kota / Kabupaten - NEW DISPLAY */}
                      <div className="bg-blue-50/70 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
                        <p className="text-blue-600/70 dark:text-blue-400/70 text-xs font-semibold mb-0.5">Kota / Kabupaten</p>
                        <p className="font-extrabold text-blue-900 dark:text-blue-100 text-sm flex items-center gap-1.5">
                          <i className="fa-solid fa-location-dot text-red-500"></i>
                          <span>{selectedItem.kota_kabupaten || 'Belum ditentukan'}</span>
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Lokasi Pelaksanaan</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">{selectedItem.lokasi_kegiatan}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-primary dark:text-blue-400 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2 uppercase tracking-wider">
                      <i className="fa-solid fa-file-pdf mr-2"></i> Dokumen Proposal & Catatan
                    </h4>
                    <div className="flex flex-col gap-4 text-sm">
                      {selectedItem.dokumen_proposal ? (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <i className="fa-solid fa-file-pdf text-3xl text-red-500"></i>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200">Proposal Kegiatan</p>
                              <p className="text-xs text-gray-500">Berkas Pendukung (Wajib)</p>
                            </div>
                          </div>
                          <a 
                            href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'}/storage/${selectedItem.dokumen_proposal}`} 
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition-colors text-xs flex items-center gap-2"
                          >
                            <i className="fa-solid fa-download"></i> Unduh Berkas
                          </a>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center py-6">
                          <i className="fa-regular fa-file-excel text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                          <p className="font-bold text-gray-500 dark:text-gray-400">Tidak ada dokumen proposal</p>
                          <p className="text-xs text-gray-400 mt-1">Pengaju tidak mengunggah file pada saat pengisian form.</p>
                        </div>
                      )}
                      
                      {selectedItem.catatan_tambahan && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Catatan Tambahan Pengaju:</p>
                          <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800/30 text-yellow-800 dark:text-yellow-400 text-sm italic">
                            "{selectedItem.catatan_tambahan}"
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
              
            </div>
            
            {/* Footer / Actions */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-3 w-full sm:w-auto bg-white dark:bg-[#1e1e1e] p-1.5 pr-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                 <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-3">Aksi:</span>
                 <select 
                   value={selectedItem.status}
                   onChange={(e) => {
                     handleUpdateStatus(selectedItem.id, selectedItem.status, e.target.value);
                     setSelectedItem({...selectedItem, status: e.target.value});
                   }}
                   className="text-sm font-semibold bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer text-gray-800 dark:text-gray-200"
                 >
                    <option value="pending">Set Pending</option>
                    <option value="verifikasi">Set Verifikasi</option>
                    <option value="penjadwalan">Set Penjadwalan</option>
                    <option value="konfirmasi">Set Konfirmasi</option>
                    <option value="disetujui">Set Disetujui</option>
                    <option value="selesai">Set Selesai</option>
                    <option value="ditolak">Set Ditolak</option>
                 </select>
               </div>
               <button 
                 onClick={closeModal}
                 className="w-full sm:w-auto px-8 py-2.5 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl font-bold shadow-sm transition-colors"
               >
                 Tutup
               </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
