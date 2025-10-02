import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance: Loader | null = null;
let loadPromise: Promise<typeof google> | null = null;

export function getGoogleMapsLoader(): Loader {
  if (!loaderInstance) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    loaderInstance = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry', 'geocoding'],
    });
  }

  return loaderInstance;
}

export async function loadGoogleMaps(): Promise<typeof google> {
  if (loadPromise) {
    return loadPromise;
  }

  const loader = getGoogleMapsLoader();
  loadPromise = loader.load();
  
  return loadPromise;
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const google = await loadGoogleMaps();
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          console.error('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const google = await loadGoogleMaps();
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    return new Promise((resolve) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          console.error('Reverse geocoding failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
