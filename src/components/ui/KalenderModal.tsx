'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  parseISO
} from 'date-fns';
import { id } from 'date-fns/locale';
import Modal from './Modal'; // Assuming you have a reusable Modal component here or we can use raw JSX.

interface Kegiatan {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  lokasi: string;
  status: 'Terlaksana' | 'Belum Dilaksanakan';
  jenis_kegiatan: string;
}

interface KalenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KalenderModal({ isOpen, onClose }: KalenderModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchKegiatan();
    }
  }, [isOpen, currentDate]);

  const fetchKegiatan = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/kalender', {
        params: {
          bulan: format(currentDate, 'MM'),
          tahun: format(currentDate, 'yyyy')
        }
      });
      setKegiatan(res.data.data);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    if (currentDate.getFullYear() < 2050) {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Generate calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      // Find events for this day
      const dayEvents = kegiatan.filter(k => {
        const start = parseISO(k.tanggal_mulai.split('T')[0]);
        const end = k.tanggal_selesai ? parseISO(k.tanggal_selesai.split('T')[0]) : start;
        return cloneDay >= start && cloneDay <= end;
      });

      days.push(
        <div
          key={day.toString()}
          className={`min-h-[100px] border-b border-r border-gray-200 p-2 transition-all ${
            !isSameMonth(day, monthStart)
              ? 'bg-gray-50 text-gray-400'
              : isSameDay(day, new Date())
              ? 'bg-blue-50/30 text-[#003366] font-semibold'
              : 'bg-white text-gray-700'
          }`}
        >
          <div className="flex justify-end">
            <span className={`text-sm ${isSameDay(day, new Date()) ? 'bg-[#003366] text-white w-6 h-6 flex items-center justify-center rounded-full' : ''}`}>
              {formattedDate}
            </span>
          </div>
          
          <div className="mt-2 flex flex-col gap-1 max-h-[80px] overflow-y-auto no-scrollbar">
            {dayEvents.map((evt, idx) => (
              <div 
                key={idx} 
                className={`text-[10px] p-1.5 rounded-md leading-tight border-l-2 shadow-sm truncate ${
                  evt.status === 'Terlaksana' 
                    ? 'bg-green-50 border-green-500 text-green-700' 
                    : 'bg-orange-50 border-orange-500 text-orange-700'
                }`}
                title={`${evt.judul}\n${evt.lokasi || ''}`}
              >
                <div className="font-bold truncate">{evt.judul}</div>
                <div className="truncate text-[9px] opacity-80">{evt.lokasi}</div>
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 w-full" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#f0f4f8] w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-white/40">
        
        {/* Motif Background (Subtle Songket) */}
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none overflow-hidden mix-blend-multiply">
          {/* Large motif top right */}
          <svg className="absolute -top-20 -right-20 w-96 h-96 text-[#003366]" viewBox="0 0 40 40" fill="currentColor">
            <path d="M20 0 L24 10 L34 6 L28 16 L40 20 L28 24 L34 34 L24 30 L20 40 L16 30 L6 34 L12 24 L0 20 L12 16 L6 6 L16 10 Z"/>
          </svg>
          {/* Small motif bottom left */}
          <svg className="absolute bottom-10 left-10 w-40 h-40 text-[#003366]" viewBox="0 0 40 40" fill="currentColor">
            <path d="M20 0 L24 10 L34 6 L28 16 L40 20 L28 24 L34 34 L24 30 L20 40 L16 30 L6 34 L12 24 L0 20 L12 16 L6 6 L16 10 Z"/>
          </svg>
        </div>

        {/* Header */}
        <div className="px-8 py-5 flex items-center justify-between border-b border-gray-200/60 bg-white/50 backdrop-blur-md z-10 relative">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003366] tracking-tight">Jadwal Kegiatan BI</h2>
          <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-gray-100">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-white m-4 rounded-2xl shadow-sm border border-gray-100 z-10">
          
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center bg-[#003366] text-white rounded-lg shadow-sm hover:bg-blue-900 transition-colors">
                <i className="fa-solid fa-chevron-left text-sm"></i>
              </button>
              <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center bg-[#003366] text-white rounded-lg shadow-sm hover:bg-blue-900 transition-colors">
                <i className="fa-solid fa-chevron-right text-sm"></i>
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())} 
                className="ml-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
              >
                Hari Ini
              </button>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 uppercase tracking-wide">
              {format(currentDate, 'MMMM yyyy', { locale: id })}
            </h3>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>

          {/* Calendar */}
          <div className="w-full bg-white border-t border-l border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Days Header */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((dayName, i) => (
                <div key={i} className="py-3 text-center text-xs font-bold text-gray-500 uppercase border-r border-gray-200">
                  {dayName}
                </div>
              ))}
            </div>
            
            {/* Grid */}
            <div className="flex flex-col relative">
              {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <i className="fa-solid fa-circle-notch animate-spin text-4xl text-[#003366]"></i>
                </div>
              )}
              {rows}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-6 justify-center text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400"></span>
              <span className="text-gray-600">Belum Dilaksanakan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">Terlaksana</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
