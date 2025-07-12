// components/AddressPicker.jsx
'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px'
};
const center = { lat: 20.5937, lng: 78.9629 };  // default India

export default function AddressPicker({ onSelect }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY
  });
  const [markerPos, setMarkerPos] = useState(null);

  const handleClick = useCallback((event) => {
    const pos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    setMarkerPos(pos);
    onSelect(pos);
  }, [onSelect]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading map…</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={5}
      onClick={handleClick}
    >
      {markerPos && <Marker position={markerPos} />}
    </GoogleMap>
  );
}
