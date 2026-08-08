'use client';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix Leaflet's default icon path issues by using custom HTML markers
const createCustomIcon = (category: string, isSearchResult: boolean = false) => {
  let color = "#2563eb"; // default SD
  if (category === 'SMP') color = "#16a34a";
  if (category === 'SMA/SMK') color = "#f97316";
  if (category === 'Perguruan Tinggi') color = "#9333ea";
  if (category === 'Komunitas') color = "#e11d48";
  if (isSearchResult) color = "#dc2626"; // Red highlight for searched location

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        background-color: ${color};
        width: ${isSearchResult ? '34px' : '28px'};
        height: ${isSearchResult ? '34px' : '28px'};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 6px 12px rgba(0,0,0,0.4);
        position: relative;
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
    iconSize: isSearchResult ? [34, 34] : [28, 28],
    iconAnchor: isSearchResult ? [17, 34] : [14, 28],
    popupAnchor: [0, isSearchResult ? -34 : -28]
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

// Controller component to smoothly fly map to searched coordinates
function MapFlyTo({ target }: { target: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [target, map]);
  return null;
}

export default function LeafletMap() {
  const [locations, setLocations] = useState<EdukasiLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<EdukasiLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);
  
  // Custom searched pin for external places (Geocoding fallback)
  const [externalSearchPin, setExternalSearchPin] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);

  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const markerRefs = useRef<{ [key: number]: L.Marker | null }>({});

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

  // Filter suggestions when user types in search input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const filtered = locations.filter(loc => 
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        loc.category.toLowerCase().includes(query.toLowerCase()) ||
        loc.description.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select a location from suggestion or database match
  const handleSelectLocation = (loc: EdukasiLocation) => {
    setSearchQuery(loc.name);
    setShowSuggestions(false);
    setExternalSearchPin(null);
    setActiveMarkerId(loc.id);

    const lat = parseFloat(loc.latitude);
    const lng = parseFloat(loc.longitude);

    setFlyTarget({ lat, lng, zoom: 17 });

    // Open popup after fly animation finishes
    setTimeout(() => {
      if (markerRefs.current[loc.id]) {
        markerRefs.current[loc.id]?.openPopup();
      }
    }, 1200);
  };

  // Execute full search (DB lookup first, then Google Maps / OpenStreetMap Geocoding API)
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    // 1. Check if exact or partial match exists in our database
    const dbMatch = locations.find(loc => 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (dbMatch) {
      handleSelectLocation(dbMatch);
      setIsSearching(false);
      return;
    }

    // 2. If not found in DB, use Geocoding API (OpenStreetMap Nominatim / Google API)
    try {
      const fullQuery = searchQuery.toLowerCase().includes('siantar') || searchQuery.toLowerCase().includes('pematang')
        ? searchQuery
        : `${searchQuery}, Pematangsiantar, Sumatera Utara`;

      const geocodeRes = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: fullQuery,
          format: 'json',
          limit: 1,
        }
      });

      if (geocodeRes.data && geocodeRes.data.length > 0) {
        const place = geocodeRes.data[0];
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);

        setExternalSearchPin({
          name: place.display_name.split(',')[0] || searchQuery,
          lat,
          lng
        });
        setActiveMarkerId(null);

        setFlyTarget({ lat, lng, zoom: 17 });
      } else {
        alert(`Lokasi "${searchQuery}" tidak ditemukan pada peta. Pastikan ejaan nama sekolah benar.`);
      }
    } catch (err) {
      console.error("Geocoding search failed", err);
      alert("Gagal melakukan pencarian lokasi. Periksa koneksi internet Anda.");
    } finally {
      setIsSearching(false);
    }
  };

  if (!mounted) return (
    <div className="w-full h-[450px] bg-gray-100 flex items-center justify-center rounded-[2rem]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
    </div>
  );

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-inner bg-gray-100 border border-gray-200">
      
      {/* Interactive Search Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] max-w-md mx-auto sm:mx-0">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-lg rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200 overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Cari lokasi sekolah (misal: SMK Negeri 1 Siantar)..."
            className="w-full py-3 pl-4 pr-12 text-sm text-gray-800 font-medium outline-none bg-transparent placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <i className="fa-solid fa-magnifying-glass"></i>
                <span>Cari</span>
              </>
            )}
          </button>
        </form>

        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto py-2 z-[1001]">
            {suggestions.map((loc) => (
              <button
                key={loc.id}
                onClick={() => handleSelectLocation(loc)}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-b-0 cursor-pointer"
              >
                <div>
                  <p className="font-bold text-xs text-gray-800">{loc.name}</p>
                  <p className="text-[10px] text-gray-400 truncate max-w-[240px]">{loc.description || loc.category}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                  {loc.category}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* The Leaflet Map Container */}
      <div style={{ height: '480px', width: '100%', zIndex: 0 }} className="relative z-0">
        <MapContainer 
          center={centerPos} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="/api/tiles/{s}/{z}/{x}/{y}.png"
          />
          
          <MapFlyTo target={flyTarget} />

          {/* Database Locations Pins */}
          {locations.map(m => (
            <Marker 
              key={m.id} 
              position={[parseFloat(m.latitude), parseFloat(m.longitude)]} 
              icon={createCustomIcon(m.category, activeMarkerId === m.id)}
              ref={(ref) => { markerRefs.current[m.id] = ref; }}
            >
              <Popup>
                <div className="font-bold text-gray-800 text-sm">{m.name}</div>
                <div className="text-[11px] font-semibold text-blue-600 mt-1 uppercase">{m.category}</div>
                {m.description && <div className="text-xs text-gray-600 mt-1 border-t pt-1">{m.description}</div>}
                <div className="text-[10px] text-gray-500 font-medium mt-2 bg-blue-50 p-1.5 rounded text-center border border-blue-100">
                  <i className="fa-solid fa-circle-check text-blue-600 mr-1"></i> Telah diedukasi oleh BI Mengajar
                </div>
              </Popup>
            </Marker>
          ))}

          {/* External Searched Pin (Geocoded) */}
          {externalSearchPin && (
            <Marker
              position={[externalSearchPin.lat, externalSearchPin.lng]}
              icon={createCustomIcon('SMA/SMK', true)}
              ref={(ref) => { ref?.openPopup(); }}
            >
              <Popup>
                <div className="font-bold text-gray-800 text-sm">{externalSearchPin.name}</div>
                <div className="text-[11px] text-orange-600 font-bold mt-1">📌 Hasil Pencarian Lokasi</div>
                <div className="text-[10px] text-gray-400 mt-1">Koordinat: {externalSearchPin.lat.toFixed(5)}, {externalSearchPin.lng.toFixed(5)}</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
