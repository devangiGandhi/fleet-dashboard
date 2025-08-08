import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VehicleMap from '../components/VehicleMap';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filterSpeed, setFilterSpeed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const BACKEND_URL = 'https://fleet-dashboard-git-main-devangi-gandhis-projects.vercel.app/'; // Replace with your URL


  useEffect(() => {
    //axios.get('http://localhost:3001/api/vehicles')
    axios.get(`${BACKEND_URL}/api/vehicles`)
      .then(res => setVehicles(res.data));
  }, []);

    // Initial fetch
  useEffect(() => {
    //axios.get(`${BACKEND_URL}/api/vehicles`)
    axios.get('http://localhost:3001/api/vehicles')
      .then(res => {
        setVehicles(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Simulated movement
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev =>
        prev.map(vehicle => ({
          ...vehicle,
          lat: vehicle.lat + (Math.random() - 0.5) * 0.002,
          lng: vehicle.lng + (Math.random() - 0.5) * 0.002,
          speed: Math.floor(30 + Math.random() * 50)
        }))
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
    <div style={{ padding: '1rem' }}>
      <h2>Fleet Dashboard</h2>
         <VehicleMap vehicles={vehicles} />
       <label>
        <input
          type="checkbox"
          checked={filterSpeed}
          onChange={() => setFilterSpeed(!filterSpeed)}
        />{' '}
        Show only vehicles going faster than 50 km/h
      </label>

      <p>Tracking {filteredVehicles.length} vehicle(s)</p>

      <VehicleMap vehicles={filteredVehicles} />
      <ul>
        {vehicles.map(v => (
          <li key={v.id}>
            {v.name} - Speed: {v.speed} km/h - Location: ({v.lat}, {v.lng})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
