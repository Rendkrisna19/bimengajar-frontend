import React from 'react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterYear: string;
  setFilterYear: (val: string) => void;
  filterProvince: string;
  setFilterProvince: (val: string) => void;
  itemsPerPage: number;
  setItemsPerPage: (val: number) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery, setSearchQuery,
  filterCategory, setFilterCategory,
  filterYear, setFilterYear,
  filterProvince, setFilterProvince,
  itemsPerPage, setItemsPerPage
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
      <div className="flex flex-wrap gap-3 w-full lg:w-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama sekolah..."
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
        </div>
        
        <select
          className="px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="Semua">Semua Kategori</option>
          <option value="SD">SD Sederajat</option>
          <option value="SMP">SMP Sederajat</option>
          <option value="SMA/SMK">SMA/SMK Sederajat</option>
          <option value="Perguruan Tinggi">Perguruan Tinggi</option>
          <option value="Komunitas">Komunitas / Lainnya</option>
        </select>

        <select
          className="px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          value={filterProvince}
          onChange={(e) => setFilterProvince(e.target.value)}
        >
          <option value="Semua">Semua Provinsi</option>
          <option value="Aceh">Aceh</option>
          <option value="Sumatera Utara">Sumatera Utara</option>
          <option value="Sumatera Barat">Sumatera Barat</option>
          <option value="Riau">Riau</option>
          <option value="Jambi">Jambi</option>
          <option value="Sumatera Selatan">Sumatera Selatan</option>
          <option value="Lampung">Lampung</option>
          <option value="Bengkulu">Bengkulu</option>
          <option value="Bangka Belitung">Bangka Belitung</option>
          <option value="Kepulauan Riau">Kepulauan Riau</option>
        </select>

        <select
          className="px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="Semua">Semua Tahun</option>
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400 font-medium">
        <span>Tampilkan:</span>
        <select
          className="px-3 py-1.5 border border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 dark:text-white cursor-pointer"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          <option value={10}>10 Data</option>
          <option value={20}>20 Data</option>
          <option value={50}>50 Data</option>
          <option value={100}>100 Data</option>
        </select>
      </div>
    </div>
  );
};
