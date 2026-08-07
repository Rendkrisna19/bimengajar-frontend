import axios from 'axios';
import { LocationFormData, ActivityForm } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getConfig = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const getFormConfig = () => {
  const token = localStorage.getItem('token');
  return { 
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'multipart/form-data' 
    } 
  };
};

export const fetchLocationsApi = async (params: any) => {
  return axios.get(`${API_URL}/locations`, {
    params,
    ...getConfig()
  });
};

export const searchExternalLocationsApi = async (params: { search: string; province?: string }) => {
  return axios.get(`${API_URL}/locations/external`, {
    params,
    ...getConfig()
  });
};

export const saveLocationApi = async (formData: LocationFormData, activities: ActivityForm[]) => {
  const payload = new FormData();
  payload.append('name', formData.name);
  payload.append('category', formData.category);
  payload.append('year', formData.year);
  payload.append('latitude', formData.latitude);
  payload.append('longitude', formData.longitude);
  payload.append('address', formData.address);
  if (formData.province) payload.append('province', formData.province);
  payload.append('description', formData.description);

  const actsJson = activities.map(a => ({
    title: a.title,
    description: a.description,
    photos: a.photos.filter(p => typeof p === 'string')
  }));
  payload.append('activities', JSON.stringify(actsJson));

  activities.forEach((act, idx) => {
    act.photos.forEach(photo => {
      if (photo instanceof File) {
        payload.append(`activities_photos_${idx}[]`, photo);
      }
    });
  });

  if (formData.id) {
    return axios.post(`${API_URL}/locations/${formData.id}`, payload, getFormConfig());
  } else {
    return axios.post(`${API_URL}/locations`, payload, getFormConfig());
  }
};

export const deleteLocationApi = async (id: number) => {
  return axios.delete(`${API_URL}/locations/${id}`, getConfig());
};
