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

export default function KalenderView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKegiatan();
  }, [currentDate]);

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
      console.error(error);
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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
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
      
      const dayEvents = kegiatan.filter(k => {
        const start = parseISO(k.tanggal_mulai.split('T')[0]);
        const end = k.tanggal_selesai ? parseISO(k.tanggal_selesai.split('T')[0]) : start;
        return cloneDay >= start && cloneDay <= end;
      });

      days.push(
        <div
          key={day.toString()}
          className={`min-h-[100px] border-b border-r border-gray-200 dark:border-gray-800 p-2 transition-all ${
            !isSameMonth(day, monthStart)
              ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600'
              : isSameDay(day, new Date())
              ? 'bg-blue-50/40 dark:bg-blue-900/20 text-primary dark:text-blue-400 font-semibold'
              : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300'
          }`}
        >
          <div className="flex justify-end">
            <span className={`text-sm ${isSameDay(day, new Date()) ? 'bg-[#fbbf24] text-white w-7 h-7 flex items-center justify-center rounded-full shadow-sm' : ''}`}>
              {formattedDate}
            </span>
          </div>
          
          <div className="mt-2 flex flex-col gap-1 max-h-[80px] overflow-y-auto no-scrollbar">
            {dayEvents.map((evt, idx) => (
              <div 
                key={idx} 
                className={`text-[10px] p-1.5 rounded-md leading-tight border-l-2 shadow-sm truncate ${
                  evt.status === 'Terlaksana' 
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400' 
                    : 'bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400'
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

  return (
    <div className="w-full bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-lg shadow-sm hover:bg-[#004080] transition-colors">
            <i className="fa-solid fa-chevron-left text-sm"></i>
          </button>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-lg shadow-sm hover:bg-[#004080] transition-colors">
            <i className="fa-solid fa-chevron-right text-sm"></i>
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())} 
            className="ml-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Hari Ini
          </button>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white uppercase tracking-wide">
          {format(currentDate, 'MMMM yyyy', { locale: id })}
        </h3>
        <div className="w-24"></div>
      </div>

      <div className="w-full bg-white dark:bg-black border-t border-l border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((dayName, i) => (
            <div key={i} className="py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-r border-gray-200 dark:border-gray-800">
              {dayName}
            </div>
          ))}
        </div>
        
        <div className="flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <i className="fa-solid fa-circle-notch animate-spin text-4xl text-primary dark:text-blue-400"></i>
            </div>
          )}
          {rows}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6 justify-center text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-400"></span>
          <span className="text-gray-600 dark:text-gray-400">Belum Dilaksanakan</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Terlaksana</span>
        </div>
      </div>
    </div>
  );
}
