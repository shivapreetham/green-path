'use client';

import {
  GoogleMap,
  Marker,
  Polyline,
  InfoWindow,
  useLoadScript,
} from '@react-google-maps/api';
import { useState, useRef, useEffect, useCallback } from 'react';

const mapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  mapTypeId: 'roadmap',
};

const ECO_COLORS = ['#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#f1c40f', '#1abc9c'];
const NAIVE_COLOR = '#e74c3c';

function mapOrderIdsToLetters(orders) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const m = {};
  orders.forEach((o, i) => {
    m[o._id] = letters[i] || `Z${i}`;
  });
  return m;
}

export default function ClusterMap({
  warehouse,
  orders,
  ecoSteps = [],
  naiveSteps = [],
  showEco,
}) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    libraries: ['geometry'],
  });
  const mapRef = useRef();
  const [activeMarker, setActiveMarker] = useState(null);
  const [truckPos, setTruckPos] = useState(null);
  const animRef = useRef();

  const orderIdToLetter = mapOrderIdsToLetters(orders);

  // Fit map to include warehouse + all orders
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(warehouse.location);
    orders.forEach(o => bounds.extend(o.address));
    map.fitBounds(bounds, 60);
  }, [warehouse, orders]);

  // Animate truck along whichever route is active
  useEffect(() => {
    const steps = showEco ? ecoSteps : naiveSteps;
    const path = steps.flatMap(s => s.polyline.map(([lat, lng]) => ({ lat, lng })));
    if (!path.length) return setTruckPos(null);

    let idx = 0;
    const speed = 0.3; // lower => slower
    const animate = () => {
      if (idx < path.length) {
        setTruckPos(path[Math.floor(idx)]);
        idx += speed;
        animRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animRef.current);
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [ecoSteps, naiveSteps, showEco]);

  if (!isLoaded) return <p>Loading map…</p>;

  // pick the active steps
  const routeSteps = showEco ? ecoSteps : naiveSteps;

  return (
    <div className="relative w-full h-[500px]">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onLoad={onMapLoad}
        options={mapOptions}
      >
        {/* Warehouse */}
        <Marker
          position={warehouse.location}
          icon={{
            url: '/warehouse-icon.png',
            scaledSize: new window.google.maps.Size(40, 40),
          }}
        />

        {/* Orders */}
        {orders.map((o) => (
          <Marker
            key={o._id}
            position={o.address}
            onClick={() => setActiveMarker(o._id)}
            icon={{
              url: '/order-pin.png',
              scaledSize: new window.google.maps.Size(36, 36), // increased size
              labelOrigin: new window.google.maps.Point(18, -12), // adjusted for new size
            }}
            label={{
              text: `Order ${orderIdToLetter[o._id]}`,
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'white',
              className: 'custom-label',
            }}
          >
            {activeMarker === o._id && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div>
                  <strong>{o.customerName}</strong>
                  <br />
                  {o.address.fullAddress}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}


        {/* Single loop for either ECO or NAIVE */}
        {routeSteps.map((step, i) => {
          const path = step.polyline.map(([lat, lng]) => ({ lat, lng }));
          // ECO: multi‐color solid; NAIVE: red dashed
          const options = showEco
            ? {
                strokeColor: ECO_COLORS[i % ECO_COLORS.length],
                strokeOpacity: 1,
                strokeWeight: 5,
                geodesic: true,
              }
            : {
                strokeColor: NAIVE_COLOR,
                strokeOpacity: 0.8,
                strokeWeight: 4,
                icons: [
                  {
                    icon: {
                      path: 'M 0,-1 0,1',
                      strokeOpacity: 1,
                      scale: 4,
                    },
                    offset: '0',
                    repeat: '10px',
                  },
                ],
              };
          return <Polyline key={i} path={path} options={options} />;
        })}

        {/* Animated truck */}
        {truckPos && (
          <Marker
            position={truckPos}
            icon={{
              url: '/truck.png',
              scaledSize: new window.google.maps.Size(36, 36),
            }}
          />
        )}
      </GoogleMap>

      {/* Legend */}
      {routeSteps.length > 0 && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded shadow-lg border text-sm">
          <strong className="block mb-2">
            {showEco ? '🌿 Eco Route Steps' : '🛣️ Naive Route Steps'}
          </strong>
          <ul className="space-y-1">
            {routeSteps.map((step, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: showEco
                      ? ECO_COLORS[i % ECO_COLORS.length]
                      : NAIVE_COLOR,
                  }}
                />
                <span>
                  {step.fromOrderId
                    ? `Order ${orderIdToLetter[step.fromOrderId]}`
                    : 'Warehouse'}{' '}
                  →{' '}
                  {step.toOrderId
                    ? `Order ${orderIdToLetter[step.toOrderId]}`
                    : 'Warehouse'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
