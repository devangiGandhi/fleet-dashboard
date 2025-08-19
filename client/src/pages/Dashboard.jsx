import React, { useEffect, useState, useRef  } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import truckIconImg from '../assets/truck-icon.png';
import truckBlue from '../assets/truck-blue.png';
import truckRed from '../assets/truck-red.png';
import Analytics from './Analytics';
import VehicleRoute from "../components/VehicleRoute";
import { haversineDistance } from '../utils/geo';
import SendWhatsAppAlert from "../components/SendWhatsAppAlert";

const blueIcon = new L.Icon({
  iconUrl: truckIconImg,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const greenIcon = new L.Icon({
  iconUrl: truckBlue,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const redIcon = new L.Icon({
  iconUrl: truckRed,
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
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const prevStatuses = useRef({}); // To compare with previous data
  const prevSpeedCategory = useRef({});

  
  const BACKEND_URL = 'http://localhost:3001';
  const total = vehicles.length;
  const fast = vehicles.filter(v => v.speed > 50).length;
  const slow = vehicles.filter(v => v.speed > 0 && v.speed <= 50).length;
  const idle = vehicles.filter(v => v.speed === 0).length;

    // Poll backend for vehicle data
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:3001/api/vehicles")
        .then((res) => res.json())
        .then((data) => {
          setVehicles(data);

          data.forEach((vehicle) => {
            const category = vehicle.speed >= 40 ? "fast" : "slow";
            const prevStatus = prevStatuses.current[vehicle.id];
            const prevCategory = prevSpeedCategory.current[vehicle.id];
            //if (alertsEnabled && prevStatus && prevStatus !== vehicle.status) {
            if (alertsEnabled) {
              // Status changed → send WhatsApp
              //sendWhatsAppAlert(vehicle.name, vehicle.status);
              sendWhatsAppAlert(
                vehicle.name,
                `Speed changed to ${category.toUpperCase()} (${vehicle.speed} km/h)`
              );
            }
            prevSpeedCategory.current[vehicle.id] = category;
            prevStatuses.current[vehicle.id] = vehicle.status;
          });
        })
        .catch((err) => console.error("Error fetching vehicles:", err));
    },  2 * 60 * 1000); // every 5 sec
    return () => clearInterval(interval);
  }, [alertsEnabled]);

  const sendWhatsAppAlert = async (vehicleName, status) => {
    try {
      await fetch("http://localhost:3001/api/vehicle-updates/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleName, status: status })
      });
      console.log(`✅ WhatsApp alert sent for ${vehicleName}`);
    } catch (err) {
      console.error("❌ Failed to send WhatsApp alert:", err);
    }
  };

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

  // Speed history tracker
  useEffect(() => {
    const interval = setInterval(() => {
      const avgSpeed = vehicles.reduce((sum, v) => sum + v.speed, 0) / vehicles.length || 0;
      setHistory(prev => [...prev, { time: new Date().toLocaleTimeString(), avgSpeed }]);
    }, 5000);
    return () => clearInterval(interval);
  }, [vehicles]);

  // Simulated movement
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
          return { ...vehicle, lat: newLat, lng: newLng, speed, distance: distance.toFixed(2), eta };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredVehicles = filterSpeed
    ? vehicles.filter(v => v.speed > 50)
    : vehicles;

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p>Error loading vehicle data.</p>;

  return (
    <div style={{ height: '100vh' }}>
      <h2>Fleet Dashboard</h2>

      {/* Navigation */}
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

          <MapContainer center={[51.5, 7.4]} zoom={10} style={{ height: 'calc(100vh - 150px)', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredVehicles.map(v => (
              <Marker
                key={v.id}
                position={[v.lat, v.lng]}
                icon={getIconBySpeed(v.speed)}
                eventHandlers={{
                  click: () => setSelectedVehicleId(v.id)
                }}
              >
                <Popup>
                  <strong>{v.name}</strong>
                  <br />
                  Speed: {v.speed} km/h
                  <br />
                  Distance: {v.distance} km
                  <br />
                  ETA: {v.eta ? `${v.eta} min` : "N/A"}
                  <br />
                </Popup>
              </Marker>
              
            ))}

            {/* Only show route for selected vehicle */}
            {selectedVehicleId && (() => {
              const vehicle = vehicles.find(v => v.id === selectedVehicleId);
              if (!vehicle) return null;
              return (
                <>
                  <VehicleRoute
                    start={{ lat: vehicle.lat, lng: vehicle.lng }}
                    end={vehicle.destination}
                  />
                  <Polyline
                    positions={[
                      [vehicle.lat, vehicle.lng],
                      [vehicle.destination.lat, vehicle.destination.lng],
                    ]}
                    pathOptions={{
                    color: vehicle.speed > 50 ? 'red' : vehicle.speed > 0 ? 'orange' : 'blue',
                    weight: 5,
                    opacity: 0.7,
                    dashArray: vehicle.speed > 0 ? "10, 10" : null,
                    }}
                  />
                </>
              );
            })()}
          </MapContainer>
          <ul>
            {vehicles.map(v => (
              <li key={v.id}>
                {v.name} - Speed: {v.speed} km/h - Location: ({v.lat}, {v.lng}) - ETA: {v.eta} min
              </li>
            ))}
          </ul>

       <button
        onClick={() => setAlertsEnabled((prev) => !prev)}
        style={{
          background: alertsEnabled ? "green" : "red",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "1rem"
        }}
      >
        {alertsEnabled ? "🔔 Alerts Enabled" : "🔕 Alerts Disabled"}
      </button>

       <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Speed</th>
            <th>Speed Category</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => {
            const category = v.speed >= 40 ? "fast" : "slow";
            return (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.status}</td>
                <td>{v.speed} km/h</td>
                <td
                  style={{
                    color: category === "fast" ? "red" : "blue",
                    fontWeight: "bold"
                  }}
                >
                  {category.toUpperCase()}
                </td>
                <td>{v.lat}, {v.lng}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <SendWhatsAppAlert />
     
         {/* <div className="stats-panel" style={{ marginBottom: '1rem', padding: '10px', background: '#f0f0f0', borderRadius: '8px' }}>
            <p>🚚 Total: {total}</p>
            <p>🔴 Fast: {fast}</p>
            <p>🟢 Slow: {slow}</p>
          </div>
        */}
        </>
      ) : (
        <Analytics vehicles={vehicles} history={history} />
      )}
    </div>
  );
}

export default Dashboard;
