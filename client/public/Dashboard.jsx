// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Analytics from './Analytics';
import VehicleRoute from '../components/VehicleRoute';
import { haversineDistance } from '../utils/geo';

// --- ICONS (stored in /public folder for reliability) ---
const blueIcon = new L.Icon({
  iconUrl: '/truck-icon.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const greenIcon = new L.Icon({
  iconUrl: '/truck-blue.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const redIcon = new L.Icon({
  iconUrl: '/truck-red.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const getIconBySpeed = (speed) => {
  if (speed === 0) return blueIcon;
  if (speed > 50) return redIcon;
  return greenIcon;
};

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filterSpeed, setFilterSpeed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('map');

  const BACKEND_URL = 'http://localhost:3001'; // Change when deploying

  // Initial fetch
  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/vehicles`)
      .then(res => {
        setVehicles(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Speed history logging
  useEffect(() => {
    const interval = setInterval(() => {
      const avgSpeed = vehicles.reduce((sum, v) => sum + v.speed, 0) / vehicles.length || 0;
      setHistory(prev => [...prev, { time: new Date().toLocaleTimeString(), avgSpeed }]);
    }, 5000);
    return () => clearInterval(interval);
  }, [vehicles]);

  // Simulated movement & ETA updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev =>
        prev.map(vehicle => {
          const newLat = vehicle.lat + (Math.random() - 0.5) * 0.002;
          const newLng = vehicle.lng + (Math.random() - 0.5) * 0.002;
          const speed = Math.floor(30 + Math.random() * 50);
          const distance = haversineDistance(
            { lat: newLat, lng: newLng },
            vehicle.destination
          );
          const eta = speed > 0 ? Math.round((distance / speed) * 60) : null;

          return {
            ...vehicle,
            lat: newLat,
            lng: newLng,
            speed,
            distance: distance.toFixed(2),
            eta
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredVehicles = filterSpeed
    ? vehicles.filter(v => v.speed > 50)
    : vehicles;

  const total = vehicles.length;
  const fast = vehicles.filter(v => v.speed > 50).length;
  const slow = vehicles.filter(v => v.speed > 0 && v.speed <= 50).length;
  const idle = vehicles.filter(v => v.speed === 0).length;

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p>Error loading vehicle data.</p>;

  return (
    <div style={{ height: '100vh' }}>
      <h2>Fleet Dashboard</h2>

      {/* View switcher */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setView('map')}
          style={{
            marginRight: '10px',
            backgroundColor: view === 'map' ? '#1976d2' : '#ccc',
            color: 'white',
            padding: '6px 12px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Map View
        </button>
        <button
          onClick={() => setView('analytics')}
          style={{
            backgroundColor: view === 'analytics' ? '#1976d2' : '#ccc',
            color: 'white',
            padding: '6px 12px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Analytics
        </button>
      </div>

      {view === 'map' ? (
        <>
          <label>
            <input
              type="checkbox"
              checked={filterSpeed}
              onChange={() => setFilterSpeed(!filterSpeed)}
            />
            Show only vehicles going faster than 50 km/h
          </label>
          <p>Tracking {filteredVehicles.length} vehicle(s)</p>

          <MapContainer center={[51.5, 7.4]} zoom={10} style={{ height: '90%' }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredVehicles.map(v => (
              <React.Fragment key={v.id}>
                <Marker position={[v.lat, v.lng]} icon={getIconBySpeed(v.speed)}>
                  <Popup>
                    <strong>{v.name}</strong>
                    <br />
                    Speed: {v.speed} km/h
                    <br />
                    Distance: {v.distance} km
                    <br />
                    ETA: {v.eta ? `${v.eta} min` : 'N/A'}
                  </Popup>
                </Marker>
                <VehicleRoute start={v} end={v.destination} />
                <Polyline
                  positions={[
                    [v.lat, v.lng],
                    [v.destination.lat, v.destination.lng],
                  ]}
                  color="blue"
                />
              </React.Fragment>
            ))}
          </MapContainer>

          {/* Stats Panel */}
          <div className="stats-panel" style={{
            marginTop: '1rem',
            padding: '10px',
            background: '#f0f0f0',
            borderRadius: '8px'
          }}>
            <p>🚚 Total: {total}</p>
            <p>🔴 Fast: {fast}</p>
            <p>🟢 Slow: {slow}</p>
            <p>🔵 Idle: {idle}</p>
          </div>
        </>
      ) : (
        <Analytics vehicles={vehicles} history={history} />
      )}
    </div>
  );
};

export default Dashboard;
