'use client';

import { useEffect, useRef } from 'react';

export default function AddressPicker({ onSelect }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 28.6139, lng: 77.2090 }, // Default: Delhi
      zoom: 12,
    });

    geocoderRef.current = new window.google.maps.Geocoder();

    map.addListener('click', (e) => {
      const latLng = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: latLng,
          map,
        });
      } else {
        markerRef.current.setPosition(latLng);
      }

      geocoderRef.current.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const fullAddress = results[0].formatted_address;
          onSelect({ address: fullAddress, lat: latLng.lat, lng: latLng.lng });
        }
      });
    });

    // Optional: Auto-locate user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const center = new window.google.maps.LatLng(latitude, longitude);
          map.setCenter(center);
        },
        (err) => console.warn("Geolocation failed:", err),
        { timeout: 5000 }
      );
    }
  }, []);

  return (
    <div className="h-[300px] w-full rounded overflow-hidden mb-3">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
