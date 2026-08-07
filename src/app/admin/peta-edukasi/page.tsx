'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useEdukasiMap } from './hooks/useEdukasiMap';
import { FilterBar } from './components/FilterBar';
import { LocationDetail } from './components/LocationDetail';

// We do NOT use MapContainer in page.tsx anymore because it is only used in LocationDetail.
// Wait, we need it if we want to show a map in list view. But the user's list view only has a table.
// So no leaflet imports in page.tsx!

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
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-gray-900">
      <div className="flex-none p-4 lg:p-8 lg:pb-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Peta Edukasi</h1>
            <p className="text-slate-500 dark:text-gray-400 mt-1">Kelola data sekolah dan instansi Peta Edukasi BI Mengajar</p>
          </div>
          
          {view === 'list' && (
            <button
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-900 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-plus"></i> Tambah Lokasi
            </button>
          )}
        </div>

        {view === 'list' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 lg:gap-4 mb-8">
            {[
              { label: 'SD Sederajat', count: categoryCounts['SD'], icon: 'fa-child', color: 'bg-green-500' },
              { label: 'SMP Sederajat', count: categoryCounts['SMP'], icon: 'fa-child-reaching', color: 'bg-blue-500' },
              { label: 'SMA/SMK', count: categoryCounts['SMA/SMK'], icon: 'fa-user-graduate', color: 'bg-purple-500' },
              { label: 'Perguruan Tinggi', count: categoryCounts['PT'], icon: 'fa-building-columns', color: 'bg-orange-500' },
              { label: 'Komunitas', count: categoryCounts['Komunitas'], icon: 'fa-users', color: 'bg-pink-500' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-slate-100 dark:border-gray-700 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white shadow-inner ${stat.color}`}>
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
      </div>

      {view === 'list' ? (
        <div className="flex-1 overflow-hidden p-4 lg:p-8 pt-0 flex flex-col min-h-0">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 lg:p-6 shadow-sm border border-slate-100 dark:border-gray-700 flex flex-col h-full overflow-hidden relative">
            <FilterBar
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              filterCategory={filterCategory} setFilterCategory={setFilterCategory}
              filterYear={filterYear} setFilterYear={setFilterYear}
              filterProvince={filterProvince} setFilterProvince={setFilterProvince}
              itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
            />

            <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 dark:border-gray-700">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-gray-800/50 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th onClick={() => handleSort('name')} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-700">
                      Nama Sekolah <i className="fa-solid fa-sort ml-1"></i>
                    </th>
                    <th onClick={() => handleSort('category')} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-700">
                      Kategori <i className="fa-solid fa-sort ml-1"></i>
                    </th>
                    <th onClick={() => handleSort('province')} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-700">
                      Provinsi <i className="fa-solid fa-sort ml-1"></i>
                    </th>
                    <th onClick={() => handleSort('year')} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-700">
                      Tahun <i className="fa-solid fa-sort ml-1"></i>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700">Galeri</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-gray-700 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {locations.length > 0 ? (
                    locations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                        <td className="p-4">
                          <div className="font-bold text-slate-800 dark:text-white">{loc.name}</div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <i className="fa-solid fa-location-dot"></i> {loc.latitude.substring(0,6)}, {loc.longitude.substring(0,6)}
                          </div>
                        </td>
                        <td className="p-4"><span className="px-3 py-1 bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-400 font-bold text-xs rounded-lg">{loc.category}</span></td>
                        <td className="p-4"><span className="text-sm text-slate-600 dark:text-gray-300 font-medium">{loc.province || '-'}</span></td>
                        <td className="p-4"><span className="text-sm font-bold text-slate-700 dark:text-gray-200">{loc.year || '-'}</span></td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {loc.photos && loc.photos.length > 0 ? (
                              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                <i className="fa-solid fa-images"></i> {loc.photos.length}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenForm(loc)} className="w-8 h-8 rounded-lg bg-blue-50 text-primary hover:bg-blue-100 flex items-center justify-center">
                              <i className="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button onClick={() => handleDelete(loc.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center">
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
                        <p>Data lokasi tidak ditemukan.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-between items-center mt-6 flex-none">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Menampilkan <span className="text-slate-800 dark:text-gray-200">{indexOfFirstItem + 1}</span> - <span className="text-slate-800 dark:text-gray-200">{indexOfLastItem}</span> dari <span className="text-slate-800 dark:text-gray-200">{totalItems}</span> data
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-50">
                    <i className="fa-solid fa-chevron-left text-xs"></i>
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${currentPage === idx + 1 ? 'bg-primary text-white' : 'border border-slate-200 hover:bg-slate-50'}`}>
                      {idx + 1}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-50">
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
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
