'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NotificationItem {
  id: number;
  nama_instansi: string;
  nama_pic: string;
  tema_kegiatan: string;
  tanggal_kegiatan: string;
  jenis_pengajuan: string;
  status: string;
  created_at: string;
}

interface NotificationContextType {
  pendingCount: number;
  notifications: NotificationItem[];
  loading: boolean;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  pendingCount: 0,
  notifications: [],
  loading: false,
  refreshNotifications: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/pengajuan-edukasi`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        const result = await res.json();
        const allData: NotificationItem[] = result.data || [];
        const pendingItems = allData.filter(
          item => item.status === 'pending' || item.status === 'verifikasi'
        );
        setNotifications(pendingItems);
        setPendingCount(pendingItems.length);
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        pendingCount,
        notifications,
        loading,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
