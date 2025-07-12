'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India

export default function AddressPicker({ onSelect }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  const [markerPos, setMarkerPos] = useState(null);

  const geocodeLatLng = async (lat, lng) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
    );
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return 'Unknown location';
  };

  const handleClick = useCallback(async (event) => {
    const pos = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarkerPos(pos);

    const fullAddress = await geocodeLatLng(pos.lat, pos.lng);

    // Send full object to parent
    onSelect({ ...pos, fullAddress });
  }, [onSelect]);

  if (loadError) return <div className="text-red-600">❌ Error loading maps</div>;
  if (!isLoaded) return <div className="text-gray-500">Loading map…</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markerPos || defaultCenter}
      zoom={markerPos ? 13 : 5}
      onClick={handleClick}
    >
      {markerPos && <Marker position={markerPos} />}
    </GoogleMap>
  );
}
