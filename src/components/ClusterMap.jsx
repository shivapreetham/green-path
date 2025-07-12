'use client';
import { GoogleMap, Marker, Polyline, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { useState } from 'react';

const COLORS = ['#4F46E5', '#16A34A', '#EA580C', '#E11D48', '#0E7490', '#7C3AED'];

export default function ClusterMap({ route = [], center, orders = [], warehouse, ecoSteps = [] }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  const [activeMarker, setActiveMarker] = useState(null);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <GoogleMap
        center={center}
        zoom={13}
        mapContainerStyle={{ height: '100%', width: '100%' }}
        onClick={() => setActiveMarker(null)}
      >
        {/* 📍 Warehouse Marker */}
        {warehouse && (
          <Marker
            position={{ lat: warehouse.location.lat, lng: warehouse.location.lng }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
            onClick={() => setActiveMarker('warehouse')}
          >
            {activeMarker === 'warehouse' && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div>
                  <strong>{warehouse.name}</strong>
                  <br />
                  {warehouse.location.address}
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* 📦 Order Markers */}
        {orders.map(order => (
          <Marker
            key={order._id}
            position={{
              lat: order.address.lat,
              lng: order.address.lng,
            }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
            onClick={() => setActiveMarker(order._id)}
          >
            {activeMarker === order._id && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div>
                  <strong>{order.customerName}</strong><br />
                  {order.address.fullAddress}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* 🛣️ Colored Eco Route Steps */}
        {ecoSteps?.map((step, idx) => (
          <Polyline
            key={idx}
            path={step.polyline.map(([lat, lng]) => ({ lat, lng }))}
            options={{
              strokeColor: COLORS[idx % COLORS.length],
              strokeWeight: 4,
              strokeOpacity: 0.9,
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
