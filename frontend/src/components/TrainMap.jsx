// src/components/TrainMap.jsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom Pulse Icon
const createPulseIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="train-marker-container">
        <div class="train-marker-ring"></div>
        <div class="train-marker-dot"></div>
        <div class="train-icon-wrapper">🚆</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Helper to auto-center map when coordinates change
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 13, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function TrainMap({ lat, lng, speed, lastUpdated }) {
  // Default center (Nagpur - center of India) if no data
  const center = [lat || 21.1458, lng || 79.0882];
  const zoom = lat ? 13 : 5;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {lat && lng && (
        <>
          <RecenterMap lat={lat} lng={lng} />
          <Marker position={[lat, lng]} icon={createPulseIcon()}>
            <Popup>
              <div className="text-center">
                <strong>Current Location</strong><br />
                Speed: {speed} km/h<br />
                <span className="text-xs text-slate-500">{lastUpdated}</span>
              </div>
            </Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}