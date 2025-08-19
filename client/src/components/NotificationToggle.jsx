import React, { useState } from "react";

function NotificationToggle() {
  const [enabled, setEnabled] = useState(true);

  const toggleNotifications = async () => {
    const res = await fetch("http://localhost:3001/api/vehicle-updates/toggle-notifications", {
      method: "POST"
    });
    const data = await res.json();
    setEnabled(data.notificationsEnabled);
  };

  return (
    <button onClick={toggleNotifications}>
      {enabled ? "🔕 Disable WhatsApp Alerts" : "🔔 Enable WhatsApp Alerts"}
    </button>
  );
}

export default NotificationToggle;
