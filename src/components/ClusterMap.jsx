'use client';
import { GoogleMap, Polyline, useLoadScript } from '@react-google-maps/api';

export default function ClusterMap({ route, center }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <GoogleMap
        center={{ lat: center[0], lng: center[1] }}
        zoom={13}
        mapContainerStyle={{ height: '100%', width: '100%' }}
      >
        <Polyline
          path={route.map(([lat, lng]) => ({ lat, lng }))}
          options={{ strokeColor: '#4A90E2', strokeWeight: 4 }}
        />
      </GoogleMap>
    </div>
  );
}
