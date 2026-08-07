'use client';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix Leaflet's default icon path issues by using custom HTML markers
const createCustomIcon = (category: string) => {
  let color = "#2563eb"; // default SD
  if (category === 'SMP') color = "#16a34a";
  if (category === 'SMA/SMK') color = "#f97316";
  if (category === 'Perguruan Tinggi') color = "#9333ea";
  if (category === 'Komunitas') color = "#e11d48";

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

interface EdukasiLocation {
  id: number;
  name: string;
  category: string;
  latitude: string;
  longitude: string;
  description: string;
}

export default function LeafletMap() {
  const [locations, setLocations] = useState<EdukasiLocation[]>([]);
  const centerPos: [number, number] = [2.9620, 99.0667]; // Center at Pematang Siantar

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/locations`, {
          params: { per_page: 1000 }
        });
        if (res.data && res.data.data) {
          const resultData = res.data.data;
          if (resultData && Array.isArray(resultData.data)) {
            setLocations(resultData.data);
          } else if (Array.isArray(resultData)) {
            setLocations(resultData);
          }
        }
      } catch (err) {
        console.error("Failed to load map locations", err);
      }
    };
    fetchLocations();
  }, []);

  if (!mounted) return (
    <div className="w-full h-[450px] bg-gray-100 flex items-center justify-center rounded-[2rem]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
    </div>
  );

  return (
    <div style={{ height: '450px', width: '100%', zIndex: 0 }} className="relative z-0">
      <MapContainer 
        center={centerPos} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map(m => (
          <Marker 
            key={m.id} 
            position={[parseFloat(m.latitude), parseFloat(m.longitude)]} 
            icon={createCustomIcon(m.category)}
          >
            <Popup>
              <div className="font-bold text-gray-800 text-sm">{m.name}</div>
              <div className="text-[11px] font-semibold text-blue-600 mt-1 uppercase">{m.category}</div>
              {m.description && <div className="text-xs text-gray-600 mt-1 border-t pt-1">{m.description}</div>}
              <div className="text-[10px] text-gray-400 mt-2">Telah diedukasi oleh BI Mengajar</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
