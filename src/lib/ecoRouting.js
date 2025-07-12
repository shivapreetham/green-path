// /lib/ecoRouting.js

import polyline from 'polyline';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const EMISSION_RATE_G_PER_KM = 120; // e.g. Petrol vehicle; override per vehicle if needed
const POI_TYPES = ['school','hospital','shopping_mall','place_of_worship'];
const POI_RADIUS_M = 100;
const POI_SAMPLES = 10;  // how many points along route to sample

/**
 * Fetches route metrics for a loop: origin -> waypoints -> origin.
 *
 * @param {{lat:number,lng:number}} origin 
 * @param {Array<{lat:number,lng:number}>} waypointsAndReturn 
 *        last element should be the same as origin to close the loop
 */
export async function getRouteMetrics(origin, waypointsAndReturn) {
  if (!GOOGLE_API_KEY) throw new Error('Missing GOOGLE_API_KEY');

  // Build Directions API URL
  const all = waypointsAndReturn;
  const dest = all[all.length - 1];
  const via = all.slice(0, -1);
  const wpParam = via.map(p => `${p.lat},${p.lng}`).join('|');

  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.set('origin',      `${origin.lat},${origin.lng}`);
  url.searchParams.set('destination', `${dest.lat},${dest.lng}`);
  if (via.length) url.searchParams.set('waypoints', wpParam);
  url.searchParams.set('key', GOOGLE_API_KEY);
  url.searchParams.set('departure_time', 'now');
  url.searchParams.set('traffic_model',  'best_guess');

  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== 'OK') {
    throw new Error(`Directions API error: ${json.status}`);
  }

  const route = json.routes[0];
  // 1) Sum up distance & duration
  let totalDistanceM = 0, totalDurationS = 0;
  // Before:
    // totalDurationS += leg.duration_in_traffic.value;

    // AFTER:
    for (const leg of route.legs) {
      totalDistanceM += leg.distance.value;
      // guard traffic duration
      const durTraffic = leg.duration_in_traffic?.value;
      totalDurationS += (durTraffic !== undefined) 
        ? durTraffic 
        : leg.duration.value;
    }

  const distanceKm = totalDistanceM / 1000;
  const durationSec = totalDurationS;

  // 2) Decode overview polyline
  const routePolyline = polyline.decode(route.overview_polyline.points);

  // 3) Estimate CO2 emissions (g)
  const co2g = distanceKm * EMISSION_RATE_G_PER_KM;

  // 4) Sample POIs along the polyline
  const step = Math.max(1, Math.floor(routePolyline.length / POI_SAMPLES));
  let sensitiveZoneCount = 0;
  for (let i = 0; i < routePolyline.length; i += step) {
    const [lat, lng] = routePolyline[i];
    for (const type of POI_TYPES) {
      const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
      placesUrl.searchParams.set('location', `${lat},${lng}`);
      placesUrl.searchParams.set('radius',   POI_RADIUS_M);
      placesUrl.searchParams.set('type',     type);
      placesUrl.searchParams.set('key',      GOOGLE_API_KEY);

      const pRes = await fetch(placesUrl);
      const pJson = await pRes.json();
      if (pJson.status === 'OK' && Array.isArray(pJson.results)) {
        sensitiveZoneCount += pJson.results.length;
      }
      // note: you may wish to rate‑limit or cache these calls
    }
  }

  return {
    distanceKm,
    durationSec,
    co2g,
    sensitiveZoneCount,
    routePolyline
  };
}
