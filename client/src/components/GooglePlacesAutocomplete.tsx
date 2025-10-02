import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { loadGoogleMaps } from '@/lib/googleMaps';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function GooglePlacesAutocomplete({
  value,
  onChange,
  label,
  placeholder = "Enter your business address...",
  disabled = false,
  className = "",
  'data-testid': testId
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAutocomplete = async () => {
      try {
        // Wait for Google Maps API to load
        await loadGoogleMaps();

        if (!isMounted) return;

        // Double-check that the API is available
        if (!window.google?.maps?.places) {
          setError('Google Maps API not available');
          setIsLoading(false);
          return;
        }

        if (!inputRef.current) return;

        // Initialize autocomplete
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          fields: ['formatted_address', 'geometry', 'address_components', 'name'],
        });

        // Listen for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (!place?.geometry?.location) {
            setError('No location data available for this address');
            return;
          }

          const address = place.formatted_address || place.name || '';
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          onChange(address, lat, lng);
          setError(null);
        });

        if (isMounted) {
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error('Error initializing Google Places:', err);
        if (isMounted) {
          setError('Failed to initialize address autocomplete');
          setIsLoading(false);
        }
      }
    };

    initializeAutocomplete();

    return () => {
      isMounted = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={error ? 'border-red-500' : ''}
          data-testid={testId}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <p className="text-xs text-gray-500">
        Start typing your address and select from the suggestions
      </p>
    </div>
  );
}
