'use client';

import { useEffect, useRef } from 'react';

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
}

export default function MapView({ center, providers, searchMarker, radius, mode, onPinSet, pinPosition }: MapViewProps) {
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

      const map = L.map('pojok-koin-map', {
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
        html: `<div style="background:#f59e0b;width:36px;height:36px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:16px;">🪙</div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
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

  return <div id="pojok-koin-map" style={{ width: '100%', height: '100%' }} />;
}
