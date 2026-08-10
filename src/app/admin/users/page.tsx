'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/users?page=${page}&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Gagal memuat data pengguna', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', email: '', password: '', role: 'user' });
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditItem(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '', // Kosongkan agar tidak perlu diisi jika tidak ganti
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus User?',
      text: "Anda tidak dapat mengembalikan ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.status === 'success') {
          Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
          fetchUsers();
        } else {
          Swal.fire('Gagal', data.message || 'Gagal menghapus user', 'error');
        }
      } catch (e) {
        Swal.fire('Error', 'Terjadi kesalahan jaringan', 'error');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const payload: any = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      if (form.password) {
        payload.password = form.password;
      }

      const url = editItem ? `${API}/users/${editItem.id}` : `${API}/users`;
      const method = editItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.status === 'success') {
        Swal.fire('Berhasil', `Data berhasil ${editItem ? 'diperbarui' : 'ditambahkan'}`, 'success');
        setIsModalOpen(false);
        fetchUsers();
      } else {
        Swal.fire('Gagal', data.message || 'Gagal menyimpan data', 'error');
      }
    } catch (e) {
      Swal.fire('Error', 'Terjadi kesalahan jaringan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola data admin dan pengguna sistem.</p>
        </div>
        <button onClick={openCreate}
          className="bg-primary hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <i className="fa-solid fa-plus"></i> Tambah User
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-end">
          <div className="relative w-full md:w-auto">
            <input type="text" placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-5 py-4 w-16 text-center">No.</th>
                  <th className="px-5 py-4">Pengguna</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4 text-center">Tanggal Daftar</th>
                  <th className="px-5 py-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">Belum ada data user.</td></tr>
                ) : users.map((user, idx) => (
                  <tr key={user.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-4 text-center text-gray-500">
                      {(page - 1) * 10 + idx + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(user)} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-300 hover:bg-primary hover:text-white transition-colors flex items-center justify-center">
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center">
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Bottom */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center gap-1">
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 transition-colors">Prev</button>
            <span className="px-3 py-1 text-sm font-bold text-gray-700 bg-gray-50 rounded flex items-center justify-center">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 transition-colors">Next</button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">{editItem ? 'Edit User' : 'Tambah User'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" required value={form.name} onChange={e => setForm(f=>({...f, name: e.target.value}))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-black text-gray-800 dark:text-white"
                  placeholder="Nama Lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alamat Email <span className="text-red-500">*</span></label>
                <input type="email" required value={form.email} onChange={e => setForm(f=>({...f, email: e.target.value}))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-black text-gray-800 dark:text-white"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password {editItem ? <span className="text-gray-400 font-normal">(Opsional)</span> : <span className="text-red-500">*</span>}</label>
                <input type="password" required={!editItem} value={form.password} onChange={e => setForm(f=>({...f, password: e.target.value}))} minLength={6}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-black text-gray-800 dark:text-white"
                  placeholder={editItem ? "Biarkan kosong jika tidak diganti" : "Minimal 6 karakter"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role (Peran) <span className="text-red-500">*</span></label>
                <select required value={form.role} onChange={e => setForm(f=>({...f, role: e.target.value}))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-black text-gray-800 dark:text-white"
                >
                  <option value="user">User Biasa</option>
                  <option value="admin">Administrator</option>
                </select>
                {editItem && editItem.role === 'admin' && form.role !== 'admin' && (
                  <p className="text-xs text-orange-500 mt-2">
                    <i className="fa-solid fa-triangle-exclamation mr-1"></i> 
                    Perhatian: Jika ini adalah satu-satunya admin, sistem akan menolak perubahan role.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >Batal</button>
                <button type="submit" disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-900 transition-colors disabled:opacity-50 shadow-md flex items-center gap-2"
                >
                  {isSubmitting ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-save"></i>}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
