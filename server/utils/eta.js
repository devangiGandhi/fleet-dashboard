export function haversineDistance(coord1, coord2) {
  const R = 6371; // km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) *
    Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

export function calculateETA(vehicle) {
  const distance = haversineDistance(
    { lat: vehicle.lat, lng: vehicle.lng },
    vehicle.destination
  );
  const hours = distance / vehicle.speed;
  return { distance: distance.toFixed(2), etaMinutes: Math.round(hours * 60) };
}
