import { useState, useCallback, useRef } from 'react';

interface GeoResult {
  lat: number;
  lon: number;
  display_name: string;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface DistanceResult {
  distanceKm: number;
  durationMin: number;
  originCoords: { lat: number; lon: number };
  destCoords: { lat: number; lon: number };
}

// Haversine formula for distance between two points
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Geocode an address using Nominatim (OpenStreetMap)
async function geocodeAddress(address: string): Promise<GeoResult | null> {
  try {
    const encodedAddress = encodeURIComponent(address + ', Brasil');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=br`,
      {
        headers: {
          'Accept-Language': 'pt-BR',
          'User-Agent': 'IBECExpress/1.0'
        }
      }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Search for address suggestions
async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  if (query.length < 3) return [];
  try {
    const encodedQuery = encodeURIComponent(query + ', Brasil');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&countrycodes=br&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'pt-BR',
          'User-Agent': 'IBECExpress/1.0'
        }
      }
    );
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Address search error:', error);
    return [];
  }
}

// Try to get route distance from OSRM (OpenStreetMap Routing Machine - free)
async function getRouteDistance(
  originLat: number, originLon: number,
  destLat: number, destLon: number
): Promise<{ distanceKm: number; durationMin: number } | null> {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`
    );
    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      return {
        distanceKm: data.routes[0].distance / 1000,
        durationMin: data.routes[0].duration / 60,
      };
    }
    return null;
  } catch (error) {
    console.error('OSRM route error:', error);
    return null;
  }
}

export function useDistance() {
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState<DistanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<AddressSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<'origin' | 'dest' | null>(null);

  // Debounce timer refs
  const originTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchOriginAddresses = useCallback((query: string) => {
    if (originTimerRef.current) clearTimeout(originTimerRef.current);
    if (query.length < 3) {
      setOriginSuggestions([]);
      return;
    }
    setLoadingSuggestions('origin');
    originTimerRef.current = setTimeout(async () => {
      const results = await searchAddresses(query);
      setOriginSuggestions(results);
      setLoadingSuggestions(null);
    }, 500);
  }, []);

  const searchDestAddresses = useCallback((query: string) => {
    if (destTimerRef.current) clearTimeout(destTimerRef.current);
    if (query.length < 3) {
      setDestSuggestions([]);
      return;
    }
    setLoadingSuggestions('dest');
    destTimerRef.current = setTimeout(async () => {
      const results = await searchAddresses(query);
      setDestSuggestions(results);
      setLoadingSuggestions(null);
    }, 500);
  }, []);

  const calculateDistance = useCallback(async (origin: string, destination: string) => {
    if (!origin || !destination) {
      setError('Informe origem e destino');
      return null;
    }

    setLoading(true);
    setError(null);
    setDistance(null);

    try {
      // Geocode both addresses
      const [originGeo, destGeo] = await Promise.all([
        geocodeAddress(origin),
        geocodeAddress(destination),
      ]);

      if (!originGeo) {
        setError('Não foi possível localizar o endereço de origem');
        setLoading(false);
        return null;
      }

      if (!destGeo) {
        setError('Não foi possível localizar o endereço de destino');
        setLoading(false);
        return null;
      }

      // Try route distance first (more accurate)
      const route = await getRouteDistance(originGeo.lat, originGeo.lon, destGeo.lat, destGeo.lon);

      let result: DistanceResult;

      if (route) {
        result = {
          distanceKm: Math.round(route.distanceKm * 10) / 10,
          durationMin: Math.round(route.durationMin),
          originCoords: { lat: originGeo.lat, lon: originGeo.lon },
          destCoords: { lat: destGeo.lat, lon: destGeo.lon },
        };
      } else {
        // Fallback to haversine (straight line)
        const straightDist = haversineDistance(originGeo.lat, originGeo.lon, destGeo.lat, destGeo.lon);
        // Multiply by 1.3 to approximate road distance
        const roadDist = straightDist * 1.3;
        result = {
          distanceKm: Math.round(roadDist * 10) / 10,
          durationMin: Math.round((roadDist / 30) * 60), // assume avg 30km/h in city
          originCoords: { lat: originGeo.lat, lon: originGeo.lon },
          destCoords: { lat: destGeo.lat, lon: destGeo.lon },
        };
      }

      setDistance(result);
      setLoading(false);
      return result;
    } catch (err) {
      console.error('Distance calculation error:', err);
      setError('Erro ao calcular distância');
      setLoading(false);
      return null;
    }
  }, []);

  const clearDistance = useCallback(() => {
    setDistance(null);
    setError(null);
  }, []);

  const clearSuggestions = useCallback((type: 'origin' | 'dest' | 'all') => {
    if (type === 'origin' || type === 'all') setOriginSuggestions([]);
    if (type === 'dest' || type === 'all') setDestSuggestions([]);
  }, []);

  // Calculate suggested price based on distance
  const calculateSuggestedPrice = useCallback((distanceKm: number, vehicleType?: 'motorista' | 'motoboy'): number => {
    // Base pricing model
    const baseFee = 8.00; // taxa base
    let perKmRate: number;

    if (vehicleType === 'motoboy') {
      perKmRate = 2.50; // R$ por km para motoboy
    } else {
      perKmRate = 3.50; // R$ por km para motorista/carro
    }

    // Minimum fare
    const calculated = baseFee + (distanceKm * perKmRate);
    const minFare = vehicleType === 'motoboy' ? 12.00 : 18.00;

    return Math.max(Math.round(calculated * 100) / 100, minFare);
  }, []);

  return {
    loading,
    distance,
    error,
    originSuggestions,
    destSuggestions,
    loadingSuggestions,
    calculateDistance,
    clearDistance,
    searchOriginAddresses,
    searchDestAddresses,
    clearSuggestions,
    calculateSuggestedPrice,
  };
}

export type { DistanceResult, AddressSuggestion };
