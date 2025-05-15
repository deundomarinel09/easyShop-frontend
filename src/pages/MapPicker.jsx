import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"; // import routing CSS
import "leaflet-routing-machine"; // import routing machine JS

// 📍 Wide bounds for map panning
const mapVisualBounds = [
  [17.40, 121.55],
  [17.80, 121.90],
];

// 📍 Strict bounds for Tuguegarao only (validation use)
const tuguegaraoStrictBounds = [
  [17.55, 121.67],
  [17.68, 121.80],
];

// 📍 CVMC hospital location
const STORE_LOCATION = { lat: 17.7032, lng: 121.7533 };
// 📦 Reverse geocode using Nominatim
async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  );
  const data = await res.json();
  return data; // full object (not just display_name)
}

// 🧭 Icons
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const storeIcon = L.icon({
  iconUrl: "/store.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});



// 🧮 Center of bounds
function getBoundsCenter(bounds) {
  const latCenter = (bounds[0][0] + bounds[1][0]) / 2;
  const lngCenter = (bounds[0][1] + bounds[1][1]) / 2;
  return [latCenter, lngCenter];
}

// 📌 Markers
function LocationMarker({ location }) {
  return location ? <Marker position={location} icon={defaultIcon} /> : null;
}

function StoreMarker({ storeLocation }) {
    return (
      <Marker position={storeLocation} icon={storeIcon}>
        <Popup>Paragua Drugstore</Popup>
      </Marker>
    );
  }
  


// 🔍 Search control
function SearchControl({ setLocation, setFieldValue }) {
  const map = useMap();

  useEffect(() => {
    if (!L.Control.geocoder) {
      console.error("Leaflet Control Geocoder plugin is not loaded.");
      return;
    }

    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", async function (e) {
        const lat = e.geocode.center.lat;
        const lng = e.geocode.center.lng;

        const margin = 0.002;

        const isInside =
          lat >= tuguegaraoStrictBounds[0][0] - margin &&
          lat <= tuguegaraoStrictBounds[1][0] + margin &&
          lng >= tuguegaraoStrictBounds[0][1] - margin &&
          lng <= tuguegaraoStrictBounds[1][1] + margin;

        if (isInside) {
          map.setMaxBounds(null);
          map.flyTo([lat, lng], 16, { duration: 1.5 });

          setTimeout(() => {
            map.setMaxBounds(mapVisualBounds);
          }, 2000);

          setLocation({ lat, lng });
          const address = await reverseGeocode(lat, lng);
          setFieldValue("address", address.display_name || "");
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

// 🖱️ Handle manual clicks
function ClickHandler({ setLocation, setFieldValue }) {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      const margin = 0.002;

      const isInside =
        lat >= tuguegaraoStrictBounds[0][0] - margin &&
        lat <= tuguegaraoStrictBounds[1][0] + margin &&
        lng >= tuguegaraoStrictBounds[0][1] - margin &&
        lng <= tuguegaraoStrictBounds[1][1] + margin;

      if (!isInside) {
        alert("Please select a location inside Tuguegarao City only.");
        return;
      }

      const geo = await reverseGeocode(lat, lng);
      const address = geo.display_name || "";

      if (!address.includes("Tuguegarao")) {
        alert("The selected location is not inside Tuguegarao City.");
        return;
      }

      setLocation({ lat, lng });
      setFieldValue("address", address);
    },
  });

  return null;
}

// ➡️ Routing Control component
function RouteControl({ start, end }) {
    const map = useMap();
  
    useEffect(() => {
      if (!start || !end) return;
  
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(start.lat, start.lng),
          L.latLng(end.lat, end.lng),
        ],
        container: null,             // no separate container for instructions
        routeWhileDragging: false,
        showAlternatives: false,
        addWaypoints: false,
        draggableWaypoints: false,
        createMarker: () => null,
        show: false,                 // Hides the instructions panel
      }).addTo(map);
  
      return () => {
        map.removeControl(routingControl);
      };
    }, [map, start, end]);
  
    return null;
  }
  
  

// 📍 Main Map Picker
export default function MapPicker({
  location,
  setLocation,
  setFieldValue,
  storeLocation,
}) {
  return (
    <MapContainer
    center={[STORE_LOCATION.lat, STORE_LOCATION.lng]}
    zoom={14}
      style={{ height: "300px", width: "100%", borderRadius: "10px" }}
      maxBounds={mapVisualBounds}
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
      <StoreMarker storeLocation={STORE_LOCATION} />

      {/* Add route if both points exist */}
      {location && <RouteControl start={STORE_LOCATION} end={location} />}
          
    </MapContainer>
  );
}
