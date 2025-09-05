import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Navigation, Star, Phone, Share, Image } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Baker } from "@shared/schema";

export default function BakerDirectory() {
  const { toast } = useToast();
  const [searchLocation, setSearchLocation] = useState("");
  const [searchRadius, setSearchRadius] = useState("25");
  const [specialty, setSpecialty] = useState("all");

  const { data: bakers, isLoading, refetch } = useQuery<Baker[]>({
    queryKey: ['/api/bakers', searchLocation, searchRadius, specialty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchLocation) params.append('location', searchLocation);
      if (searchRadius !== 'all') params.append('radius', searchRadius);
      if (specialty !== 'all') params.append('specialty', specialty);
      
      const response = await fetch(`/api/bakers?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch bakers');
      return response.json();
    }
  });

  const handleSearch = () => {
    refetch();
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, would reverse geocode coordinates to get address
          setSearchLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
          toast({
            title: "Location detected",
            description: "Using your current location to find nearby bakers.",
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to access your location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const handleContactBaker = (baker: Baker) => {
    if (baker.phone) {
      window.location.href = `tel:${baker.phone}`;
    }
  };

  const handleShareEstimate = (bakerId: string) => {
    toast({
      title: "Share estimate",
      description: "Estimate sharing functionality will be implemented soon.",
    });
  };

  const handleViewPortfolio = (bakerId: string) => {
    toast({
      title: "Portfolio viewer",
      description: "Portfolio viewer will be implemented soon.",
    });
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-accent text-accent" />
        ))}
        {hasHalfStar && <Star className="w-4 h-4 fill-accent/50 text-accent" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-accent" />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">{rating}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-serif font-semibold mb-6 text-foreground">
            Find Professional Bakers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Input
                  id="location"
                  placeholder="Enter city, state, or ZIP code"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-location"
                />
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div>
              <Label htmlFor="radius">Radius</Label>
              <Select value={searchRadius} onValueChange={setSearchRadius}>
                <SelectTrigger data-testid="select-search-radius">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                  <SelectItem value="100">100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger data-testid="select-specialty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="wedding">Wedding Cakes</SelectItem>
                  <SelectItem value="custom">Custom Designs</SelectItem>
                  <SelectItem value="vegan">Vegan Options</SelectItem>
                  <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button onClick={handleSearch} data-testid="button-search-bakers">
              <Search className="w-4 h-4 mr-2" />
              Search Bakers
            </Button>
            <Button
              variant="outline"
              onClick={handleUseCurrentLocation}
              data-testid="button-use-current-location"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Use Current Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Baker Results */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading bakers...</p>
        </div>
      ) : bakers && bakers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bakers.map((baker) => (
            <Card key={baker.id} className="hover:shadow-md transition-shadow" data-testid={`card-baker-${baker.id}`}>
              <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 mx-auto">
                      <i className="fas fa-birthday-cake text-primary text-2xl"></i>
                    </div>
                    <p className="text-sm text-foreground font-medium">Professional Bakery</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground" data-testid={`text-baker-name-${baker.id}`}>
                      {baker.name}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-baker-location-${baker.id}`}>
                      {baker.address}
                    </p>
                  </div>
                  <div className="text-right">
                    {renderStars(baker.rating || "5")}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {baker.specialties?.slice(0, 3).map((specialty, index) => (
                    <Badge
                      key={index}
                      variant={index === 0 ? "default" : "secondary"}
                      className="text-xs"
                      data-testid={`badge-specialty-${baker.id}-${index}`}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-4" data-testid={`text-baker-description-${baker.id}`}>
                  {baker.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground" data-testid={`text-price-range-${baker.id}`}>
                    {baker.priceRange}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewPortfolio(baker.id)}
                      data-testid={`button-view-portfolio-${baker.id}`}
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleContactBaker(baker)}
                      data-testid={`button-contact-baker-${baker.id}`}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShareEstimate(baker.id)}
                      data-testid={`button-share-estimate-${baker.id}`}
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No bakers found. Try adjusting your search criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {bakers && bakers.length > 0 && (
        <div className="text-center">
          <Button variant="secondary" size="lg" data-testid="button-load-more-bakers">
            Load More Bakers
          </Button>
        </div>
      )}
    </div>
  );
}
