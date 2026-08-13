import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  origin: [number, number] | null;
  destination: [number, number] | null;
}

export function LocationPicker({ origin, destination }: Props) {
  const center = origin ?? destination ?? [39.5, -98.35];
  const zoom = origin && destination ? 6 : origin || destination ? 10 : 4;

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full rounded-lg" key={`${origin}-${destination}`}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' />
      {origin && <Marker position={origin} icon={icon} />}
      {destination && <Marker position={destination} icon={icon} />}
      {origin && destination && <Polyline positions={[origin, destination]} color="#B6FF2E" weight={3} />}
    </MapContainer>
  );
}