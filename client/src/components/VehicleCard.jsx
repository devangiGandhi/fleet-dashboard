import React, { useState } from "react";

function VehicleCard({ vehicle }) {
  const [sending, setSending] = useState(false);

  const sendStatusUpdate = async () => {
    setSending(true);
    await fetch("http://localhost:3001/api/vehicle-updates/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleName: vehicle.name,
        status: vehicle.status
      })
    });
    setSending(false);
  };

  return (
    <div className="vehicle-card">
      <h3>{vehicle.name}</h3>
      <p>Status: {vehicle.status}</p>
      <button onClick={sendStatusUpdate} disabled={sending}>
        {sending ? "Sending..." : "Send WhatsApp Alert"}
      </button>
    </div>
  );
}

export default VehicleCard;
