export interface EdukasiLocation {
  id: number;
  name: string;
  category: string;
  year?: number | null;
  latitude: string;
  longitude: string;
  address: string | null;
  province?: string | null;
  description: string | null;
  activities: string[] | null;
  photos: string[] | null;
}

export interface SummaryCounts {
  SD: number;
  SMP: number;
  SMA_SMK: number;
  PT: number;
  Komunitas: number;
}

export interface ActivityForm {
  title: string;
  description: string;
  photos: (File | string)[];
}

export interface LocationFormData {
  id: number | null;
  name: string;
  category: string;
  year: string;
  latitude: string;
  longitude: string;
  address: string;
  province: string;
  description: string;
}

export interface SortConfig {
  key: 'name' | 'category' | 'province' | 'year';
  direction: 'asc' | 'desc';
}


