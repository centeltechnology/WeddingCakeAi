import { useState, useEffect } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Phone, Globe, Instagram, Facebook, Filter, Search, Locate, Loader2, Map, Grid3X3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import MarketplaceMap from "@/components/MarketplaceMap";
import type { Baker } from "@shared/schema";

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const { data: bakers = [], isLoading } = useQuery<Baker[]>({
    queryKey: ["/api/bakers/public"],
  });

  // Enhanced location matching with aliases and area coverage
  const getLocationMatches = (searchLocation: string, bakerAddress: string | undefined) => {
    if (!searchLocation || !bakerAddress) return !searchLocation;
    
    const search = searchLocation.toLowerCase();
    const address = bakerAddress.toLowerCase();
    
    // Direct match
    if (address.includes(search)) return true;
    
    // City aliases and area coverage
    const locationAliases: Record<string, string[]> = {
      'nyc': ['new york', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten island'],
      'new york city': ['new york', 'manhattan', 'brooklyn', 'queens', 'bronx'],
      'la': ['los angeles', 'hollywood', 'beverly hills', 'santa monica'],
      'los angeles': ['hollywood', 'beverly hills', 'west hollywood', 'santa monica'],
      'sf': ['san francisco', 'south bay', 'bay area'],
      'san francisco': ['south bay', 'bay area', 'peninsula'],
      'chicago': ['cook county', 'chicagoland'],
      'miami': ['south beach', 'coral gables', 'miami beach'],
      'seattle': ['bellevue', 'redmond', 'tacoma'],
      'boston': ['cambridge', 'somerville', 'brookline'],
      'philadelphia': ['philly'],
      'philly': ['philadelphia']
    };
    
    // Check if search term has aliases that match the address
    const searchAliases = locationAliases[search] || [];
    if (searchAliases.some(alias => address.includes(alias))) return true;
    
    // Check reverse - if address contains a term that has the search as an alias
    for (const [key, aliases] of Object.entries(locationAliases)) {
      if (address.includes(key) && aliases.includes(search)) return true;
    }
    
    // State matching
    const stateAbbreviations: Record<string, string> = {
      'california': 'ca', 'texas': 'tx', 'florida': 'fl', 'new york': 'ny',
      'illinois': 'il', 'pennsylvania': 'pa', 'ohio': 'oh', 'georgia': 'ga',
      'michigan': 'mi', 'north carolina': 'nc', 'new jersey': 'nj', 'virginia': 'va',
      'washington': 'wa', 'arizona': 'az', 'massachusetts': 'ma', 'tennessee': 'tn',
      'indiana': 'in', 'missouri': 'mo', 'maryland': 'md', 'wisconsin': 'wi',
      'colorado': 'co', 'minnesota': 'mn', 'south carolina': 'sc', 'alabama': 'al',
      'louisiana': 'la', 'kentucky': 'ky', 'oregon': 'or', 'oklahoma': 'ok',
      'connecticut': 'ct', 'utah': 'ut', 'iowa': 'ia', 'nevada': 'nv',
      'arkansas': 'ar', 'mississippi': 'ms', 'kansas': 'ks', 'new mexico': 'nm',
      'nebraska': 'ne', 'idaho': 'id', 'west virginia': 'wv', 'hawaii': 'hi',
      'new hampshire': 'nh', 'maine': 'me', 'montana': 'mt', 'rhode island': 'ri',
      'delaware': 'de', 'south dakota': 'sd', 'north dakota': 'nd', 'alaska': 'ak',
      'vermont': 'vt', 'wyoming': 'wy'
    };
    
    // Check state name to abbreviation
    const stateAbbrev = stateAbbreviations[search];
    if (stateAbbrev && address.includes(` ${stateAbbrev}`)) return true;
    
    // Check abbreviation to state name
    for (const [stateName, abbrev] of Object.entries(stateAbbreviations)) {
      if (search === abbrev && address.includes(stateName)) return true;
    }
    
    return false;
  };

  const handleAutoLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      // Get user's current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use Nominatim to reverse geocode
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
        {
          headers: {
            'User-Agent': 'Bakewise-Marketplace/1.0 (contact@bakewiseapp.com)'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      // Extract city or town name
      const city = data.address?.city || 
                  data.address?.town || 
                  data.address?.village || 
                  data.address?.county ||
                  data.address?.state;
      
      if (city) {
        setLocationFilter(city);
      } else {
        throw new Error('Could not determine city from location');
      }
      
    } catch (error) {
      console.error('Auto-location failed:', error);
      
      let errorMessage = 'Unable to get your location. ';
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
        }
      } else {
        errorMessage += 'Please try typing your location manually.';
      }
      
      alert(errorMessage);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const filteredBakers = bakers.filter((baker: Baker) => {
    const matchesSearch = 
      baker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      baker.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      baker.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = getLocationMatches(locationFilter, baker.address);
    
    const matchesSpecialty = !specialtyFilter || specialtyFilter === "all" ||
      baker.specialties?.some(specialty => 
        specialty.toLowerCase().includes(specialtyFilter.toLowerCase())
      );
    
    const matchesPrice = !priceFilter || priceFilter === "all" || baker.priceRange === priceFilter;

    return matchesSearch && matchesLocation && matchesSpecialty && matchesPrice;
  });

  const sortedBakers = [...filteredBakers].sort((a: Baker, b: Baker) => {
    switch (sortBy) {
      case "rating":
        return (parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
      case "name":
        return a.name.localeCompare(b.name);
      case "location":
        return (a.address || "").localeCompare(b.address || "");
      default:
        return 0;
    }
  });

  const specialties = [
    "Wedding Cakes",
    "Birthday Cakes", 
    "Custom Designs",
    "Cupcakes",
    "Corporate Events",
    "Gluten-Free",
    "Vegan Options",
    "Fondant Specialist",
    "Buttercream",
    "Tiered Cakes"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Discover Amazing Cake Artists
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect baker for your special occasion. Browse local cake artists, 
            compare portfolios, and book your dream cake.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bakers or business names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-bakers"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Location (NYC, California, 90210)"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 pr-10"
                data-testid="input-location-filter"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAutoLocation}
                disabled={isGettingLocation}
                className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-pink-50"
                title="Use my location"
                data-testid="button-auto-location"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin text-pink-600" />
                ) : (
                  <Locate className="h-4 w-4 text-pink-600" />
                )}
              </Button>
            </div>
            
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger data-testid="select-specialty-filter">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger data-testid="select-price-filter">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="$">$ - Budget Friendly</SelectItem>
                <SelectItem value="$$">$$ - Moderate</SelectItem>
                <SelectItem value="$$$">$$$ - Premium</SelectItem>
                <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort-by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count and View Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {isLoading ? "Loading..." : `${sortedBakers.length} baker${sortedBakers.length !== 1 ? 's' : ''} found`}
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center space-x-1"
              data-testid="button-grid-view"
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Grid</span>
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="flex items-center space-x-1"
              data-testid="button-map-view"
            >
              <Map className="h-4 w-4" />
              <span>Map</span>
            </Button>
          </div>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="mb-8">
            <MarketplaceMap 
              bakers={sortedBakers}
              onBakerSelect={(baker) => {
                // Scroll to baker card or open profile
                console.log('Selected baker:', baker.name);
              }}
            />
          </div>
        )}

        {/* Baker Cards Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBakers.map((baker: Baker) => (
            <Card key={baker.id} className="hover:shadow-xl transition-shadow duration-300 overflow-hidden" data-testid={`card-baker-${baker.id}`}>
              {/* Portfolio Image */}
              {baker.portfolio && baker.portfolio.length > 0 && (
                <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 relative overflow-hidden">
                  <img 
                    src={baker.portfolio[0]} 
                    alt={`${baker.name}'s work`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{baker.businessName || baker.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      {baker.rating && (
                        <div className="flex items-center mr-3">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-sm font-medium">{baker.rating}</span>
                        </div>
                      )}
                      {baker.priceRange && (
                        <span className="text-green-600 font-medium">{baker.priceRange}</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                
                {baker.address && (
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {baker.address}
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                {baker.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {baker.description}
                  </p>
                )}
                
                {/* Specialties */}
                {baker.specialties && baker.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {baker.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {baker.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{baker.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Contact Options */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {baker.phone && (
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" data-testid={`button-phone-${baker.id}`}>
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                    {baker.socialMedia?.website && (
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" data-testid={`button-website-${baker.id}`}>
                        <Globe className="h-4 w-4" />
                      </Button>
                    )}
                    {baker.socialMedia?.instagram && (
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" data-testid={`button-instagram-${baker.id}`}>
                        <Instagram className="h-4 w-4" />
                      </Button>
                    )}
                    {baker.socialMedia?.facebook && (
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" data-testid={`button-facebook-${baker.id}`}>
                        <Facebook className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/baker/${baker.id}/profile`}>
                      <Button size="sm" variant="outline" data-testid={`button-view-profile-${baker.id}`}>
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/baker/${baker.id}/calculator`}>
                      <Button size="sm" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200" data-testid={`button-get-quote-${baker.id}`}>
                        Get Quote
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && sortedBakers.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bakers found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all available bakers.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setLocationFilter("");
              setSpecialtyFilter("");
              setPriceFilter("");
            }} data-testid="button-clear-filters">
              Clear All Filters
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}