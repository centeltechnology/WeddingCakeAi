import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/googleMaps';
import type { Baker } from '@shared/schema';

interface GoogleMarketplaceMapProps {
  bakers: Baker[];
  className?: string;
  onBakerSelect?: (baker: Baker) => void;
}

export default function GoogleMarketplaceMap({ bakers, className = '', onBakerSelect }: GoogleMarketplaceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setIsLoaded(true))
      .catch(error => console.error('Failed to load Google Maps:', error));
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Create map centered on USA
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 },
      zoom: 4,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    // Create single info window for reuse
    infoWindowRef.current = new google.maps.InfoWindow();

  }, [isLoaded]);

  // Update markers when bakers change
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Filter bakers with valid coordinates
    const validBakers = bakers.filter(baker => 
      baker.latitude && baker.longitude && 
      !isNaN(parseFloat(baker.latitude.toString())) && 
      !isNaN(parseFloat(baker.longitude.toString()))
    );

    if (validBakers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    // Create markers for each baker
    validBakers.forEach(baker => {
      if (!mapInstanceRef.current) return;

      const lat = parseFloat(baker.latitude!.toString());
      const lng = parseFloat(baker.longitude!.toString());
      const position = { lat, lng };

      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: baker.businessName || baker.name,
        animation: google.maps.Animation.DROP,
      });

      // Create info window content
      const contentString = `
        <div class="p-3 max-w-xs">
          <h3 class="font-semibold text-base mb-1">${baker.businessName || baker.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${baker.address || ''}</p>
          ${baker.rating ? `<div class="flex items-center mb-1">
            <span class="text-yellow-500">★</span>
            <span class="text-sm ml-1">${baker.rating}</span>
          </div>` : ''}
          ${baker.priceRange ? `<p class="text-sm text-green-600 font-medium mb-2">${baker.priceRange}</p>` : ''}
          <button 
            data-baker-id="${baker.slug || baker.id}"
            class="view-profile-btn mt-2 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded transition-colors"
          >
            View Profile
          </button>
        </div>
      `;

      // Add click listener to marker
      marker.addListener('click', () => {
        if (!infoWindowRef.current || !mapInstanceRef.current) return;
        
        infoWindowRef.current.setContent(contentString);
        infoWindowRef.current.open(mapInstanceRef.current, marker);

        // Add listener to "View Profile" button after info window opens
        google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
          const viewButton = document.querySelector(`[data-baker-id="${baker.slug || baker.id}"]`);
          if (viewButton) {
            viewButton.addEventListener('click', () => {
              if (onBakerSelect) {
                onBakerSelect(baker);
              }
            });
          }
        });
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit map to show all markers
    if (validBakers.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
      
      // Prevent over-zooming for single marker
      google.maps.event.addListenerOnce(mapInstanceRef.current, 'bounds_changed', () => {
        if (validBakers.length === 1 && mapInstanceRef.current) {
          const zoom = mapInstanceRef.current.getZoom();
          if (zoom && zoom > 15) {
            mapInstanceRef.current.setZoom(15);
          }
        }
      });
    }

  }, [bakers, onBakerSelect, isLoaded]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-96 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
      data-testid="google-marketplace-map"
    />
  );
}
