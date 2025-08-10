// src/components/VehicleRoute.jsx
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const VehicleRoute = ({ start, end }) => {
  useEffect(() => {
    if (!start || !end) return;

    // Make sure Leaflet has been initialized with a map
    const map = window.LMapInstance; // We'll set this in Dashboard.jsx
    if (!map) return;

    // Create routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng),
      ],
      lineOptions: {
        styles: [{ color: 'blue', weight: 4 }],
      },
      createMarker: () => null, // Hide extra markers
      addWaypoints: false,
      routeWhileDragging: false,
      show: false,
    }).addTo(map);

    routingControl.on('routingerror', (e) => {
      console.error('Routing error:', e.error || e);
    });

    return () => {
      try {
        if (map && routingControl) {
          map.removeControl(routingControl);
        }
      } catch (err) {
        console.warn('Route cleanup skipped:', err.message);
      }
    };
  }, [start, end]);

  return null;
};

export default VehicleRoute;
