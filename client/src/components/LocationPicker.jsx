import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function MapClick({ onPick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPick({ type: "Point", coordinates: [lng, lat] });
    },
  });
  return null;
}

function Recenter({ latlng }) {
  const map = useMap();
  useEffect(() => {
    if (latlng) map.setView(latlng, Math.max(map.getZoom(), 14), { animate: true });
  }, [latlng, map]);
  return null;
}

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

export default function LocationPicker({ value, onChange }) {
  const latlng =
    value?.coordinates?.length === 2
      ? [value.coordinates[1], value.coordinates[0]]
      : null;

  function requestGeolocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onChange({ type: "Point", coordinates: [longitude, latitude] });
      },
      () => {},
      { timeout: 12000, enableHighAccuracy: true }
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="h-56 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
        <MapContainer
          center={latlng || DEFAULT_CENTER}
          zoom={latlng ? 14 : DEFAULT_ZOOM}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClick onPick={onChange} />
          <Recenter latlng={latlng} />
          {latlng ? <Marker position={latlng} /> : null}
        </MapContainer>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn" onClick={requestGeolocation}>
          Use my current location
        </button>
        {value ? (
          <button type="button" className="btn" onClick={() => onChange(null)}>
            Clear pin
          </button>
        ) : null}
      </div>
      <p className="helper !mt-0">
        Tap the map to drop a pin, or use GPS. Location is optional but helps officers find the issue.
      </p>
    </div>
  );
}
