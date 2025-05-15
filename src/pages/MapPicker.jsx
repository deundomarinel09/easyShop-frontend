import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

// 📍 Tuguegarao boundary
const tuguegaraoBounds = [
  [17.5900, 121.7000],
  [17.6400, 121.7600],
];

// 🧠 Reverse geocode using Nominatim
async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  );
  const data = await res.json();
  return data.display_name || "";
}

// 🧭 Marker component
function LocationMarker({ location }) {
  return location ? <Marker position={location} /> : null;
}

// 🔎 Search bar using leaflet-control-geocoder
function SearchControl({ setLocation, setFieldValue }) {
  const map = useMap();

  useEffect(() => {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", async function (e) {
        const { center } = e.geocode;
        const isInside =
          center.lat >= tuguegaraoBounds[0][0] &&
          center.lat <= tuguegaraoBounds[1][0] &&
          center.lng >= tuguegaraoBounds[0][1] &&
          center.lng <= tuguegaraoBounds[1][1];

        if (isInside) {
          map.setView(center, 16);
          setLocation({ lat: center.lat, lng: center.lng });

          const address = await reverseGeocode(center.lat, center.lng);
          setFieldValue("address", address);
        } else {
          alert("Only locations inside Tuguegarao City are allowed.");
        }
      })
      .addTo(map);

    return () => {
      geocoder.remove();
    };
  }, [map, setLocation, setFieldValue]);

  return null;
}

// 🖱️ Handle map clicks
function ClickHandler({ setLocation, setFieldValue }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const isInside =
        lat >= tuguegaraoBounds[0][0] &&
        lat <= tuguegaraoBounds[1][0] &&
        lng >= tuguegaraoBounds[0][1] &&
        lng <= tuguegaraoBounds[1][1];

      if (isInside) {
        setLocation({ lat, lng });

        const address = await reverseGeocode(lat, lng);
        setFieldValue("address", address);
      } else {
        alert("Please select a location inside Tuguegarao City only.");
      }
    },
  });

  return null;
}

// 🌍 Main MapPicker component
export default function MapPicker({ location, setLocation, setFieldValue }) {
  return (
    <MapContainer
      center={[17.6131, 121.7269]} // Tuguegarao City center
      zoom={14}
      style={{ height: "300px", width: "100%", borderRadius: "10px" }}
      maxBounds={tuguegaraoBounds}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SearchControl setLocation={setLocation} setFieldValue={setFieldValue} />
      <ClickHandler setLocation={setLocation} setFieldValue={setFieldValue} />
      <LocationMarker location={location} />
    </MapContainer>
  );
}
