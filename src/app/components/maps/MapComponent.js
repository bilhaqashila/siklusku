'use client';

import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-gray-100">
      Loading map...
    </div>
  ),
});

export default function MapComponent({ locationPermissionGranted }) {
  return <MapWithNoSSR locationPermissionGranted={locationPermissionGranted} />;
}