import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}

const LocationPickerMap: React.FC<LocationPickerProps> = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e: any) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  React.useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { animate: true, duration: 1.5 });
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

export default function MapSection({ position, setPosition }: LocationPickerProps) {
  // Center to Sumatera by default
  const defaultCenter: [number, number] = [0.0, 102.0];

  return (
    <div className="h-full w-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
      {typeof window !== 'undefined' && (
        <MapContainer
          center={defaultCenter}
          zoom={5}
          style={{ height: '100%', width: '100%', zIndex: 10 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="/api/tiles/{s}/{z}/{x}/{y}.png"
          />
          <LocationPickerMap position={position} setPosition={setPosition} />
        </MapContainer>
      )}
    </div>
  );
}
