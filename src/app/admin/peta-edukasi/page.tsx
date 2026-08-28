 'use client';

import React from 'react';
import { useEdukasiMap } from './hooks/useEdukasiMap';
import { FilterBar } from './components/FilterBar';
import { LocationDetail } from './components/LocationDetail';

export default function PetaEdukasiAdmin() {
  const {
    locations, view, setView, isLoading,
    formData, setFormData, activities, setActivities,
    position, setPosition, suggestions, setSuggestions, isSearching,
    searchQuery, setSearchQuery, filterCategory, setFilterCategory,
    filterYear, setFilterYear, filterProvince, setFilterProvince,
    sortConfig, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalItems, totalPages, indexOfFirstItem, indexOfLastItem,
    categoryCounts, handleSort, handleOpenForm, handleSearchInput,
    handleSubmit, handleDelete
  } = useEdukasiMap();

  return (
    <div className="min-h-full p-4 lg:p-8 bg-slate-50 dark:bg-gray-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Peta Edukasi</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Kelola data sekolah dan instansi Peta Edukasi BI Mengajar</p>
        </div>
        
        {view === 'list' && (
          <button
            onClick={() => handleOpenForm(null)}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-900 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <i className="fa-solid fa-plus"></i> Tambah Lokasi
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {view === 'list' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
          {[
            { label: 'SD Sederajat', count: categoryCounts['SD'], icon: 'fa-child', color: 'bg-green-500' },
            { label: 'SMP Sederajat', count: categoryCounts['SMP'], icon: 'fa-child-reaching', color: 'bg-blue-500' },
            { label: 'SMA/SMK', count: categoryCounts['SMA/SMK'], icon: 'fa-user-graduate', color: 'bg-purple-500' },
            { label: 'Perguruan Tinggi', count: categoryCounts['PT'], icon: 'fa-building-columns', color: 'bg-orange-500' },
            { label: 'Komunitas', count: categoryCounts['Komunitas'], icon: 'fa-users', color: 'bg-pink-500' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${stat.color}`}>
                <i className={`fa-solid ${stat.icon} text-lg lg:text-xl`}></i>
              </div>
              <div>
                <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-white leading-none mt-1">{stat.count}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Table / Detail View */}
      {view === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 lg:p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <FilterBar
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            filterCategory={filterCategory} setFilterCategory={setFilterCategory}
            filterYear={filterYear} setFilterYear={setFilterYear}
            filterProvince={filterProvince} setFilterProvince={setFilterProvince}
            itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-gray-700 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}

            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead className="bg-slate-100 dark:bg-gray-700/50">
                <tr>
                  <th onClick={() => handleSort('name')} className="p-4 text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors">
                    Nama Sekolah <i className="fa-solid fa-sort ml-1 text-slate-400"></i>
                  </th>
                  <th onClick={() => handleSort('category')} className="p-4 text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors">
                    Kategori <i className="fa-solid fa-sort ml-1 text-slate-400"></i>
                  </th>
                  <th onClick={() => handleSort('province')} className="p-4 text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors">
                    Provinsi <i className="fa-solid fa-sort ml-1 text-slate-400"></i>
                  </th>
                  <th onClick={() => handleSort('year')} className="p-4 text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors">
                    Tahun <i className="fa-solid fa-sort ml-1 text-slate-400"></i>
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700">Galeri</th>
                  <th className="p-4 text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {locations.length > 0 ? (
                  locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-white">{loc.name}</div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <i className="fa-solid fa-location-dot text-primary"></i> {loc.latitude ? parseFloat(loc.latitude).toFixed(4) : '-'}, {loc.longitude ? parseFloat(loc.longitude).toFixed(4) : '-'}
                        </div>
                      </td>
                      <td className="p-4"><span className="px-3 py-1 bg-blue-50 text-primary dark:bg-blue-900/40 dark:text-blue-300 font-bold text-xs rounded-lg">{loc.category}</span></td>
                      <td className="p-4"><span className="text-sm text-slate-600 dark:text-gray-300 font-medium">{loc.province || '-'}</span></td>
                      <td className="p-4"><span className="text-sm font-bold text-slate-700 dark:text-gray-200">{loc.year || '-'}</span></td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {loc.photos && loc.photos.length > 0 ? (
                            <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                              <i className="fa-solid fa-images"></i> {loc.photos.length}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-mono">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenForm(loc)} className="w-8 h-8 rounded-lg bg-blue-50 text-primary hover:bg-blue-100 flex items-center justify-center transition-colors cursor-pointer" title="Edit">
                            <i className="fa-solid fa-pen text-xs"></i>
                          </button>
                          <button onClick={() => handleDelete(loc.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer" title="Hapus">
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <i className="fa-solid fa-inbox text-4xl mb-3 opacity-20"></i>
                      <p className="font-medium text-sm">Data lokasi tidak ditemukan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <span className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                Menampilkan <span className="text-slate-900 dark:text-white font-black">{indexOfFirstItem + 1}</span> - <span className="text-slate-900 dark:text-white font-black">{indexOfLastItem}</span> dari <span className="text-slate-900 dark:text-white font-black">{totalItems}</span> data
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1} 
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentPage(idx + 1)} 
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === idx + 1 
                        ? 'bg-primary text-white shadow-md shadow-primary/30' 
                        : 'border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages} 
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <LocationDetail
          formData={formData} setFormData={setFormData}
          activities={activities} setActivities={setActivities}
          position={position} setPosition={setPosition}
          suggestions={suggestions} isSearching={isSearching} setSuggestions={setSuggestions}
          handleSearchInput={handleSearchInput}
          handleSubmit={handleSubmit} isLoading={isLoading}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  );
}
