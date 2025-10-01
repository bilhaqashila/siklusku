'use client';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, useMap } from 'react-leaflet';
import { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import Labs from '@/app/local-data/labs';

// Custom icons configuration
import L from 'leaflet';
import NearestLabs from './NearestLabs';

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Map({ locationPermissionGranted }) {
  const [position, setPosition] = useState(null);
  const [nearestLabs, setNearestLabs] = useState([]);
  const mapRef = useRef();

  // Effect untuk otomatis mencari lokasi ketika permission diberikan
  useEffect(() => {
    if (locationPermissionGranted && mapRef.current) {
      mapRef.current.locate({ setView: true, maxZoom: 16 });
    }
  }, [locationPermissionGranted]);

  // Effect untuk menghitung lab terdekat
  useEffect(() => {
    if (!position) return;

    // Convert user position to LatLng
    const userLatLng = L.latLng(position.lat, position.lng);

    // Calculate distances for all labs
    const labsWithDistance = Labs.map(lab => ({
      ...lab,
      distance: userLatLng.distanceTo(L.latLng(lab.latitude, lab.longitude))
    }));

    // Sort by distance and get top 3
    const nearest = labsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    setNearestLabs(nearest);
  }, [position]);

  function LocationMarker({ locationPermissionGranted }) {
    const map = useMapEvents({
      locationfound(e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      },
    });

    useEffect(() => {
      if (locationPermissionGranted) {
        map.locate({ setView: true, maxZoom: 16 });
      }
    }, [locationPermissionGranted, map]);

    return position === null ? null : (
      <Marker position={position} icon={redIcon}>
        <Popup>
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <p className="font-medium text-pink-600">Lokasi Kamu</p>
            </div>
          </div>
        </Popup>
      </Marker>
    );
  }

  function LabsMarker() {
    return Labs.map(lab => (
      <Marker 
        key={lab.id} 
        position={[lab.latitude, lab.longitude]} 
        icon={yellowIcon}
      >
        <Popup>
          <div className="bg-white rounded-lg p-3 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏥</span>
              <h3 className="font-bold text-pink-600">{lab.name}</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>📍</span> {lab.address}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>📞</span> {lab.phone}
              </p>
            </div>
          </div>
        </Popup>
      </Marker>
    ));
  }

  return (
    <>
      <MapContainer 
        center={[-6.2088, 106.8456]} 
        zoom={13} 
        scrollWheelZoom={true}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker locationPermissionGranted={locationPermissionGranted} />
        <LabsMarker />
        <NearestLabs />
      </MapContainer>

      <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border-2 border-pink-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🏥</span>
          <h2 className="text-xl font-bold text-[#382b22]">Lab Terdekat dari Kamu</h2>
        </div>
        {position ? (
          nearestLabs.length > 0 ? (
            <div className="space-y-4">
              {nearestLabs.map(lab => (
                <div 
                  key={lab.id} 
                  className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-pink-600 mb-1">{lab.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span>📞</span> {lab.phone}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <span>📍</span> {lab.address}
                      </p>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-full border border-pink-200">
                      <p className="text-sm font-medium text-pink-600">
                        {(lab.distance / 1000).toFixed(2)} km
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lab.latitude},${lab.longitude}`)}
                    className="mt-3 w-full bg-white text-pink-600 px-4 py-2 rounded-lg text-sm font-medium border-2 border-pink-200 hover:bg-pink-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>🗺️</span> Lihat Rute
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full mb-4"></div>
              <p className="text-gray-600">Mencari lab terdekat...</p>
            </div>
          )
        ) : (
          <div className="text-center py-8 px-4">
            <p className="text-gray-600">
              <span className="block text-4xl mb-3">🎯</span>
              Izinkan akses lokasi untuk menemukan lab terdekat dari kamu
            </p>
          </div>
        )}
      </div>
    </>
  );
}