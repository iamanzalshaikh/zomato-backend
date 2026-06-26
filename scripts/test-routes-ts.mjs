import dotenv from 'dotenv';
dotenv.config();

const { getRoutePolyline } = await import('../src/services/routing.service.ts');

const origin = { latitude: 19.2403, longitude: 73.1307 };
const dest = { latitude: 19.1970, longitude: 73.0780 };

const path = await getRoutePolyline({ origin, destination: dest });
console.log('getRoutePolyline points:', path?.length ?? 0);
