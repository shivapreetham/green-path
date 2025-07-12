// components/AddressPicker.jsx
'use client';

import React, { useEffect, useRef } from 'react';

export default function AddressPicker({ onSelect }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // load the Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // India center
        zoom: 5,
      });

      map.addListener('click', (e) => {
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        // place or move marker
        if (markerRef.current) {
          markerRef.current.setPosition(e.latLng);
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: e.latLng,
            map,
          });
        }
        onSelect(pos);
      });
    }
  }, [onSelect]);

  return (
    <div>
      <p>Click on the map to choose your delivery location:</p>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '300px', border: '1px solid #ccc' }}
      />
    </div>
  );
}
