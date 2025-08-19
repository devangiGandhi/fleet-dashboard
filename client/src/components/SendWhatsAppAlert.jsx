import React, { useState, useEffect } from "react";

function SendWhatsAppAlert() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch the list of vehicles from your backend
  useEffect(() => {
    fetch("http://localhost:3001/api/vehicles")
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((err) => console.error("Failed to fetch vehicles:", err));
  }, []);

  const sendAlert = async () => {
    if (!selectedVehicle || !status) {
      alert("Please select a vehicle and enter a status");
      return;
    }

    setSending(true);
    await fetch("http://localhost:3001/api/vehicle-updates/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleName: selectedVehicle,
        status
      })
    });
    setSending(false);
    alert("WhatsApp alert sent!");
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid gray", margin: "1rem 0" }}>
      <h3>Send WhatsApp Alert</h3>

      <label>Vehicle:</label>
      <select
        value={selectedVehicle}
        onChange={(e) => setSelectedVehicle(e.target.value)}
      >
        <option value="">-- Select --</option>
        {vehicles.map((v) => (
          <option key={v.id} value={v.name}>
            {v.name}
          </option>
        ))}
      </select>

      <br /><br />

      <label>Status:</label>
      <input
        type="text"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        placeholder="e.g. Arrived at destination"
      />

      <br /><br />

      <button onClick={sendAlert} disabled={sending}>
        {sending ? "Sending..." : "Send WhatsApp Alert"}
      </button>
    </div>
  );
}

export default SendWhatsAppAlert;
