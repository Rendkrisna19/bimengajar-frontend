'use client';

import { useEffect, useRef, useId } from 'react';

interface CoinProvider {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  total_coins: number;
  denominations: string[];
  address: string;
  whatsapp: string;
  distance?: number;
}

interface MapViewProps {
  center: [number, number];
  providers: CoinProvider[];
  searchMarker: [number, number] | null;
  radius: number;
  mode: 'search' | 'pin';
  onPinSet: (lat: number, lng: number) => void;
  pinPosition?: [number, number] | null;
  mapId?: string;
}

export default function MapView({ center, providers, searchMarker, radius, mode, onPinSet, pinPosition, mapId }: MapViewProps) {
  const reactId = useId();
  const uniqueMapId = mapId || `map-${reactId.replace(/:/g, '')}`;
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const searchMarkerRef = useRef<any>(null);
  const pinMarkerRef = useRef<any>(null);
  const providerMarkersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mapRef.current) return; // already initialized

    import('leaflet').then(L => {
      leafletRef.current = L;

      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(uniqueMapId, {
        center,
        zoom: 13,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;

      // Pin mode: click to set location
      if (mode === 'pin') {
        map.on('click', (e: any) => {
          onPinSet(e.latlng.lat, e.latlng.lng);
        });
      }
    });

    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map center
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, 13);
    }
  }, [center]);

  // Update search marker + radius circle
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (searchMarkerRef.current) { searchMarkerRef.current.remove(); searchMarkerRef.current = null; }
    if (circleRef.current) { circleRef.current.remove(); circleRef.current = null; }

    if (searchMarker) {
      const youIcon = L.divIcon({
        html: `<div style="background:#003366;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      searchMarkerRef.current = L.marker(searchMarker, { icon: youIcon }).addTo(map).bindPopup('<b>Lokasi Anda</b>');

      if (radius > 0) {
        circleRef.current = L.circle(searchMarker, {
          radius: radius * 1000,
          color: '#003366',
          fillColor: '#003366',
          fillOpacity: 0.06,
          weight: 2,
          dashArray: '6,4',
        }).addTo(map);
      }
    }
  }, [searchMarker, radius]);

  // Update provider markers
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    providerMarkersRef.current.forEach(m => m.remove());
    providerMarkersRef.current = [];

    providers.forEach(p => {
      const coinIcon = L.divIcon({
        html: `<div style="background:linear-gradient(135deg,#f59e0b,#d97706);width:38px;height:38px;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
          </svg>
        </div>`,
        className: '',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });
      const m = L.marker([p.latitude, p.longitude], { icon: coinIcon })
        .addTo(map)
        .bindPopup(`
          <b style="color:#003366">${p.name}</b><br/>
          <small>📍 ${p.address}</small><br/>
          <small>💰 Rp${p.total_coins.toLocaleString('id-ID')}</small><br/>
          ${p.distance !== undefined ? `<small>📏 ${p.distance.toFixed(2)} KM</small><br/>` : ''}
          <a href="https://wa.me/${p.whatsapp.replace(/\D/g,'').replace(/^0/,'62')}" target="_blank" style="color:#16a34a;font-weight:bold;font-size:12px">💬 Hubungi via WA</a>
        `);
      providerMarkersRef.current.push(m);
    });
  }, [providers]);

  // Update pin marker for registration mode
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (pinMarkerRef.current) { pinMarkerRef.current.remove(); pinMarkerRef.current = null; }

    if (pinPosition) {
      const pinIcon = L.divIcon({
        html: `<div style="background:#003366;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });
      pinMarkerRef.current = L.marker(pinPosition, { icon: pinIcon }).addTo(map).bindPopup('<b>Lokasi Anda</b>').openPopup();
    }
  }, [pinPosition]);

  return <div id={uniqueMapId} style={{ width: '100%', height: '100%' }} />;
}
