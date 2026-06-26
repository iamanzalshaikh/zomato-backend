import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GOOGLE_ROUTES_API_KEY;
const origin = { latitude: 19.2403, longitude: 73.1307 };
const dest = { latitude: 19.1970, longitude: 73.0780 };

console.log('GOOGLE_ROUTES_API_KEY present:', Boolean(key));

if (!key) {
  console.log('No key — skip Google test');
  process.exit(1);
}

const body = {
  origin: { location: { latLng: origin } },
  destination: { location: { latLng: dest } },
  travelMode: 'DRIVE',
  routingPreference: 'TRAFFIC_AWARE',
};

const res = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes?key=${key}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-FieldMask': 'routes.duration,routes.polyline.encodedPolyline',
  },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log('Google Routes HTTP status:', res.status);
if (!res.ok) {
  console.log('Google Routes error body:', text.slice(0, 500));
} else {
  const data = JSON.parse(text);
  const poly = data.routes?.[0]?.polyline?.encodedPolyline;
  console.log('Has encoded polyline:', Boolean(poly));
  console.log('Polyline length (chars):', poly?.length ?? 0);
}

// OSRM fallback
const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${dest.longitude},${dest.latitude}?overview=full&geometries=geojson`;
const osrmRes = await fetch(osrmUrl);
const osrmData = await osrmRes.json();
console.log('OSRM status:', osrmRes.status, 'code:', osrmData.code);
console.log('OSRM points:', osrmData.routes?.[0]?.geometry?.coordinates?.length ?? 0);
