import { googleRoutePolyline } from "./google-maps.service.js";

export type RoutePoint = { latitude: number; longitude: number };

function isValidPoint(p?: RoutePoint | null): p is RoutePoint {
  return (
    !!p &&
    Number.isFinite(p.latitude) &&
    Number.isFinite(p.longitude) &&
    !(p.latitude === 0 && p.longitude === 0)
  );
}

/** Decode Google's encoded polyline — shared for tests and fallbacks. */
export function decodePolyline(encoded: string): RoutePoint[] {
  const points: RoutePoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

/** Free OSRM routing fallback when Google Routes is unavailable. */
export async function osrmRoutePolyline(input: {
  origin: RoutePoint;
  destination: RoutePoint;
  waypoints?: RoutePoint[];
}): Promise<RoutePoint[] | null> {
  const stops = [input.origin, ...(input.waypoints ?? []), input.destination];
  if (stops.length < 2) return null;

  const coordStr = stops.map((p) => `${p.longitude},${p.latitude}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      code?: string;
      routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>;
    };

    const coords = data.routes?.[0]?.geometry?.coordinates;
    if (!coords?.length) return null;

    return coords.map(([longitude, latitude]) => ({ latitude, longitude }));
  } catch {
    return null;
  }
}

/** Google Routes first, then OSRM — never returns a 2-point straight segment. */
export async function getRoutePolyline(input: {
  origin: RoutePoint;
  destination: RoutePoint;
  waypoints?: RoutePoint[];
}): Promise<RoutePoint[] | null> {
  const google = await googleRoutePolyline({
    origin: input.origin,
    destination: input.destination,
    waypoints: input.waypoints,
  });
  if (google && google.length >= 3) return google;

  const osrm = await osrmRoutePolyline(input);
  if (osrm && osrm.length >= 3) return osrm;

  // Prefer a short Google path over nothing; avoid misleading 2-point lines.
  if (google && google.length >= 2) return google;
  return osrm;
}

export { isValidPoint };
