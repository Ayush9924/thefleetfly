import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMapTracker() {
  const { locations } = useRealtime();

  return (
    <MapContainer center={[28.7041, 77.1025]} zoom={10} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {Object.entries(locations).map(([driverId, loc]) => (
        <Marker key={driverId} position={[loc.latitude, loc.longitude]}>
          <Popup>
            Driver: {driverId}<br />
            Speed: {loc.speed || 'N/A'} km/h
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}