import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Fuel Icon (Using a simple Emoji-based DivIcon for flair)
const fuelIcon = L.divIcon({
    html: `<div style="font-size: 24px;">⛽</div>`,
    className: 'fuel-marker',
    iconSize: [30, 30],
});

// Component to auto-center the map when the trip changes
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

const MapPreview = ({ originCoord = [40.7128, -74.0060], destCoord = [34.0522, -118.2437] }) => {
  
  // Calculate a "Fuel Stop" halfway between the two points
  const fuelStopCoord = [
    (originCoord[0] + destCoord[0]) / 2,
    (originCoord[1] + destCoord[1]) / 2
  ];

  const routePath = [originCoord, fuelStopCoord, destCoord];

  return (
    <div className="h-[450px] w-full relative">
      <MapContainer 
        center={originCoord} 
        zoom={4} 
        className="h-full w-full"
      >
        <ChangeView center={originCoord} />
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* The Route Line */}
        <Polyline 
            positions={routePath} 
            color="#3b82f6" 
            weight={5} 
            opacity={0.7} 
            dashArray="10, 10" 
        />

        {/* Start Marker */}
        <Marker position={originCoord}>
          <Popup><b className="text-blue-600">Origin/Pickup</b></Popup>
        </Marker>

        {/* Fuel Stop Marker */}
        <Marker position={fuelStopCoord} icon={fuelIcon}>
          <Popup>
            <div className="text-center">
                <b className="text-orange-500">Suggested Fuel Stop</b><br/>
                <span className="text-xs text-slate-500">Optimal pricing detected</span>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={destCoord}>
          <Popup><b className="text-emerald-600">Destination/Dropoff</b></Popup>
        </Marker>
      </MapContainer>
      
      {/* Small Overlay Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 p-3 rounded-lg border border-slate-700 text-[10px] text-white space-y-1">
          <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-500 border-dashed"></div> Path
          </div>
          <div className="flex items-center gap-2">
              <span>⛽</span> Fuel Stop
          </div>
      </div>
    </div>
  );
};

export default MapPreview;