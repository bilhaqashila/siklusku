import { Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet';

const yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function NearestLabs({ nearestLabs }) {
    const map = useMap();

    if (!nearestLabs || nearestLabs.length === 0) return null;

    return nearestLabs.map(lab => (
      <Marker 
        key={`nearest-${lab.id}`}
        position={[lab.latitude, lab.longitude]}
        icon={yellowIcon}
      >
        <Popup className="custom-popup">
          <div className="bg-white rounded-lg shadow-lg p-3 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏥</span>
              <h3 className="font-bold text-pink-600">{lab.name}</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-pink-500">📍</span>
                {lab.address}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-pink-500">📞</span>
                {lab.phone}
              </p>
              <div className="flex items-center gap-2 mt-2 bg-pink-50 p-2 rounded-md">
                <span className="text-pink-500">🚶‍♀️</span>
                <p className="text-sm font-medium text-pink-600">
                  Jarak: {(lab.distance / 1000).toFixed(2)} km
                </p>
              </div>
            </div>
            <button 
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lab.latitude},${lab.longitude}`)}
              className="mt-3 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>🗺️</span> Buka di Google Maps
            </button>
          </div>
        </Popup>
      </Marker>
    ));
}