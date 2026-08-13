import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  getFleetConnection,
  startFleetConnection,
} from "../signalr/fleetTrackingConnection";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const liveIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  className: "hue-rotate-[60deg]", // visually distinguish the live position from static origin/destination
});

interface Props {
  tripId: number;
  originLat?: number | null;
  originLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
}

export function RouteMap({
  tripId,
  originLat,
  originLng,
  destinationLat,
  destinationLng,
}: Props) {
  const [livePosition, setLivePosition] = useState<[number, number] | null>(
    null,
  );

  useEffect(() => {
    const connection = getFleetConnection();

    const handleUpdate = (updatedTripId: number, lat: number, lng: number) => {
      if (updatedTripId === tripId) setLivePosition([lat, lng]);
    };

    connection.on("ReceiveLocationUpdate", handleUpdate);

    const join = () =>
      connection.invoke("JoinTripGroup", tripId).catch(() => {});
    connection.onreconnected(join);
    startFleetConnection()
      .then(join)
      .catch(() => {});

    return () => {
      connection.off("ReceiveLocationUpdate", handleUpdate);
      connection.invoke("LeaveTripGroup", tripId).catch(() => {});
    };
  }, [tripId]);

  const hasOrigin = originLat != null && originLng != null;

  if (!hasOrigin && !livePosition) {
    return (
      <div className="h-full flex items-center justify-center text-gray-600 text-sm">
        No route coordinates set for this trip.
      </div>
    );
  }

  const origin: [number, number] | null = hasOrigin
    ? [originLat!, originLng!]
    : null;
  const destination: [number, number] | null =
    destinationLat != null && destinationLng != null
      ? [destinationLat, destinationLng]
      : null;
  const center = livePosition ?? origin ?? destination!;

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      className="h-full w-full rounded-lg"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
      />
      {origin && <Marker position={origin} icon={icon} />}
      {destination && <Marker position={destination} icon={icon} />}
      {origin && destination && (
        <Polyline
          positions={[origin, destination]}
          color="#B6FF2E"
          weight={2}
          opacity={0.5}
        />
      )}
      {livePosition && <Marker position={livePosition} icon={liveIcon} />}
      <Recenter position={livePosition} />
    </MapContainer>
  );
}

function Recenter({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true });
  }, [position]);
  return null;
}
