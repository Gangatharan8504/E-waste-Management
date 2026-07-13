import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* Fix default marker icons */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function MapUpdater({ position }) {
  const map = useMap();

  if (position) {
    map.setView(position, 15);
  }

  return null;
}

function LocationMarker({ setLocation, position, setPosition }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLocation(lat, lng);
    }
  });

  return position ? <Marker position={position} /> : null;
}

function LocationPicker({ setLocation, setAddress }) {

  const [position, setPosition] = useState(null);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.error("Reverse geocoding failed");
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setPosition([lat, lng]);
      setLocation(lat, lng);
      reverseGeocode(lat, lng);
    });
  };

  const handleLocationSet = (lat, lng) => {
    setLocation(lat, lng);
    reverseGeocode(lat, lng);
  };

  return (
    <div className="space-y-3">

      {/* Current Location Button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm"
      >
        📍 Use Current Location
      </button>

      {/* Map Wrapper (Z-Index Fix) */}
      <div className="relative z-0 rounded-xl overflow-hidden border shadow-sm">

        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "320px", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater position={position} />

          <LocationMarker
            setLocation={handleLocationSet}
            position={position}
            setPosition={setPosition}
          />
        </MapContainer>

      </div>

      <p className="text-xs text-gray-500">
        Click on the map to select pickup location.
      </p>

    </div>
  );
}

export default LocationPicker;