import { create } from 'zustand';

const useLocationStore = create((set) => ({
  position: null,
  nearbyLabs: [],
  locationPermissionGranted: false,
  showLocationToast: false,

  setPosition: (position) => set({ position }),
  setNearbyLabs: (labs) => set({ nearbyLabs: labs }),
  setLocationPermissionGranted: (granted) => set({ locationPermissionGranted: granted }),
  setShowLocationToast: (show) => set({ showLocationToast: show }),

  // Action untuk menghitung lab terdekat
  calculateNearbyLabs: (position, allLabs) => {
    if (!position) return;
    
    const L = require('leaflet');
    const userLatLng = L.latLng(position.lat, position.lng);

    const labsWithDistance = allLabs.map(lab => ({
      ...lab,
      distance: userLatLng.distanceTo(L.latLng(lab.latitude, lab.longitude))
    }));

    const nearest = labsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    set({ nearbyLabs: nearest });
  },
}))

export default useLocationStore;