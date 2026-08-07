import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { EdukasiLocation, LocationFormData, ActivityForm, SortConfig } from '../types';
import { fetchLocationsApi, saveLocationApi, deleteLocationApi, searchExternalLocationsApi } from '../services/edukasi.service';

export const useEdukasiMap = () => {
  const [locations, setLocations] = useState<EdukasiLocation[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<LocationFormData>({
    id: null,
    name: '',
    category: 'SD',
    year: new Date().getFullYear().toString(),
    latitude: '',
    longitude: '',
    address: '',
    province: '',
    description: '',
  });

  const [activities, setActivities] = useState<ActivityForm[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filters, Sort, Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterYear, setFilterYear] = useState('Semua');
  const [filterProvince, setFilterProvince] = useState('Semua');
  
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [summaryCounts, setSummaryCounts] = useState<any>({
    SD: 0, SMP: 0, SMA_SMK: 0, PT: 0, Komunitas: 0
  });
  const [totalItems, setTotalItems] = useState(0);

  // Fast 150ms debounce for responsive instant searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 whenever search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterCategory, filterYear, filterProvince]);

  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterCategory, filterYear, filterProvince, itemsPerPage, currentPage, sortConfig]);

  useEffect(() => {
    if (position) {
      setFormData(prev => ({ ...prev, latitude: position[0].toString(), longitude: position[1].toString() }));
    }
  }, [position]);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        per_page: itemsPerPage,
        page: currentPage,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (filterCategory && filterCategory !== 'Semua') params.category = filterCategory;
      if (filterYear && filterYear !== 'Semua') params.year = filterYear;
      if (filterProvince && filterProvince !== 'Semua') params.province = filterProvince;
      
      if (sortConfig) {
        params.sort_key = sortConfig.key;
        params.sort_direction = sortConfig.direction;
      }

      const res = await fetchLocationsApi(params);
      
      if (res.data.summary) {
        setSummaryCounts(res.data.summary);
      }

      const resultData = res.data.data;
      if (resultData && Array.isArray(resultData.data)) {
        setLocations(resultData.data);
        setTotalItems(resultData.total || 0);
      } else {
        setLocations(Array.isArray(resultData) ? resultData : []);
        setTotalItems(Array.isArray(resultData) ? resultData.length : 0);
      }
    } catch (err) {
      console.error('Failed to fetch locations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: SortConfig['key']) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleOpenForm = (loc: EdukasiLocation | null = null) => {
    if (loc) {
      setFormData({
        id: loc.id,
        name: loc.name,
        category: loc.category,
        year: loc.year ? loc.year.toString() : new Date().getFullYear().toString(),
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address || '',
        province: loc.province || '',
        description: loc.description || ''
      });
      setPosition([parseFloat(loc.latitude), parseFloat(loc.longitude)]);
      setActivities(loc.activities && loc.activities.length > 0 ? (loc.activities as any) : [{ title: '', description: '', photos: [] }]);
    } else {
      setFormData({ 
        id: null, name: '', category: 'SD', year: new Date().getFullYear().toString(), 
        latitude: '', longitude: '', address: '', province: '', description: '' 
      });
      setPosition(null);
      setActivities([{ title: '', description: '', photos: [] }]);
    }
    setSuggestions([]);
    setView('form');
  };

  const handleSearchInput = async (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    
    if (value.length > 2) {
      setIsSearching(true);
      try {
        const res = await searchExternalLocationsApi({ 
          search: value, 
          ...(formData.province && formData.province !== 'Semua' ? { province: formData.province } : {}) 
        });
        if (res.data && res.data.data) {
          setSuggestions(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) return Swal.fire('Error', 'Pilih titik lokasi di peta!', 'error');

    setIsLoading(true);
    try {
      await saveLocationApi(formData, activities);
      Swal.fire({ title: 'Berhasil', text: 'Data lokasi berhasil disimpan!', icon: 'success', showConfirmButton: false, timer: 1500 });
      setView('list');
      fetchLocations();
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ 
      title: 'Hapus Lokasi?', 
      text: "Data yang dihapus tidak bisa dikembalikan!", 
      icon: 'warning', 
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (result.isConfirmed) {
      try {
        await deleteLocationApi(id);
        Swal.fire({ title: 'Terhapus!', text: 'Data lokasi telah dihapus.', icon: 'success', showConfirmButton: false, timer: 1500 });
        fetchLocations();
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalItems);

  const categoryCounts = {
    'SD': summaryCounts.SD || 0,
    'SMP': summaryCounts.SMP || 0,
    'SMA/SMK': summaryCounts.SMA_SMK || 0,
    'PT': summaryCounts.PT || 0,
    'Komunitas': summaryCounts.Komunitas || 0,
  };

  return {
    locations,
    view, setView,
    isLoading,
    formData, setFormData,
    activities, setActivities,
    position, setPosition,
    suggestions, setSuggestions,
    isSearching,
    searchQuery, setSearchQuery,
    filterCategory, setFilterCategory,
    filterYear, setFilterYear,
    filterProvince, setFilterProvince,
    sortConfig,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    totalItems, totalPages,
    indexOfFirstItem, indexOfLastItem,
    categoryCounts,
    handleSort,
    handleOpenForm,
    handleSearchInput,
    handleSubmit,
    handleDelete
  };
};
