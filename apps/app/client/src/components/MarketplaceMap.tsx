import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Baker } from '@shared/schema';

// Fix for missing marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MarketplaceMapProps {
  bakers: Baker[];
  className?: string;
  onBakerSelect?: (baker: Baker) => void;
}

export default function MarketplaceMap({ bakers, className = '', onBakerSelect }: MarketplaceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([39.8283, -98.5795], 4); // Center on USA

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for bakers with coordinates
    const validBakers = bakers.filter(baker => 
      baker.latitude && baker.longitude && 
      !isNaN(parseFloat(baker.latitude.toString())) && 
      !isNaN(parseFloat(baker.longitude.toString()))
    );

    if (validBakers.length === 0) return;

    // Create markers
    validBakers.forEach(baker => {
      if (!mapInstanceRef.current) return;
      
      const lat = parseFloat(baker.latitude!.toString());
      const lng = parseFloat(baker.longitude!.toString());
      
      const marker = L.marker([lat, lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-base mb-1">${baker.businessName || baker.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${baker.address || ''}</p>
            ${baker.rating ? `<div class="flex items-center mb-1">
              <span class="text-yellow-500">★</span>
              <span class="text-sm ml-1">${baker.rating}</span>
            </div>` : ''}
            ${baker.priceRange ? `<p class="text-sm text-green-600 font-medium">${baker.priceRange}</p>` : ''}
            <button 
              onclick="window.selectBaker('${baker.slug || baker.id}')" 
              class="mt-2 px-3 py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700 transition-colors"
            >
              View Profile
            </button>
          </div>
        `, {
          maxWidth: 300,
          className: 'baker-popup'
        });

      markersRef.current.push(marker);

      // Handle marker click
      marker.on('click', () => {
        if (onBakerSelect) {
          onBakerSelect(baker);
        }
      });
    });

    // Fit map to markers if we have any
    if (validBakers.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    // Global function for popup button clicks
    (window as any).selectBaker = (bakerIdentifier: string) => {
      const baker = bakers.find(b => b.slug === bakerIdentifier || b.id === bakerIdentifier);
      if (baker && onBakerSelect) {
        onBakerSelect(baker);
      }
    };

  }, [bakers, onBakerSelect]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-96 rounded-lg border border-gray-200 ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}