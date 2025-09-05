import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Navigation, Star, Phone, Share, Image, ArrowRight, Store } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import PortfolioGallery from "./PortfolioGallery";
import ContactBakerModal from "./ContactBakerModal";
import type { Baker } from "@shared/schema";

interface BakerDirectoryProps {
  onSwitchToBakersPortal?: () => void;
}

export default function BakerDirectory({ onSwitchToBakersPortal }: BakerDirectoryProps = {}) {
  const { toast } = useToast();
  const [searchLocation, setSearchLocation] = useState("");
  const [searchRadius, setSearchRadius] = useState("25");
  const [specialty, setSpecialty] = useState("all");
  const [selectedBaker, setSelectedBaker] = useState<Baker | null>(null);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

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
    setSelectedBaker(baker);
    setShowContactModal(true);
  };

  const handleShareEstimate = (bakerId: string) => {
    toast({
      title: "Share estimate",
      description: "Estimate sharing functionality will be implemented soon.",
    });
  };

  const handleViewPortfolio = (bakerId: string) => {
    const baker = bakers?.find(b => b.id === bakerId);
    if (baker) {
      setSelectedBaker(baker);
      setShowPortfolio(true);
    }
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
    <div className="space-y-8">
      {/* Search & Filters */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-white/95 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground">
                Find Professional Bakers
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Connect with local wedding cake specialists
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button 
              onClick={handleSearch} 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold h-12"
              data-testid="button-search-bakers"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Bakers
            </Button>
            <Button
              variant="outline"
              onClick={handleUseCurrentLocation}
              className="border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 font-semibold h-12"
              data-testid="button-use-current-location"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Use Current Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Baker Callout */}
      {onSwitchToBakersPortal && (
        <Card className="border border-gradient-to-r from-primary/20 to-purple-500/20 bg-gradient-to-r from-primary/5 via-purple-50/50 to-primary/5 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Are you a baker?</h3>
                  <p className="text-sm text-muted-foreground">
                    Claim your listing & upgrade to reach more couples
                  </p>
                </div>
              </div>
              <Button
                onClick={onSwitchToBakersPortal}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                data-testid="button-switch-to-bakers-portal"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Baker Results */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading bakers...</p>
        </div>
      ) : bakers && bakers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bakers.map((baker) => (
            <Card key={baker.id} className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 bg-gradient-to-br from-white to-white/90 backdrop-blur-sm" data-testid={`card-baker-${baker.id}`}>
              <div className="aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-t-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 flex items-center justify-center">
                  <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                    <div className="w-20 h-20 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-lg">
                      <span className="text-3xl">🎂</span>
                    </div>
                    <p className="text-sm text-foreground font-semibold">Professional Bakery</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
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

                <div className="flex flex-wrap gap-2 mb-6">
                  {baker.specialties?.slice(0, 3).map((specialty, index) => (
                    <Badge
                      key={index}
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        index === 0 
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md' 
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                      } transition-all duration-200`}
                      data-testid={`badge-specialty-${baker.id}-${index}`}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-4" data-testid={`text-baker-description-${baker.id}`}>
                  {baker.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 rounded-full">
                    <span className="text-sm font-bold text-primary" data-testid={`text-price-range-${baker.id}`}>
                      {baker.priceRange}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-10 h-10 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => handleViewPortfolio(baker.id)}
                      data-testid={`button-view-portfolio-${baker.id}`}
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-10 h-10 rounded-full hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                      onClick={() => handleContactBaker(baker)}
                      data-testid={`button-contact-baker-${baker.id}`}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-10 h-10 rounded-full hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
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
          <Button 
            variant="outline"
            size="lg"
            className="px-8 py-4 border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 font-semibold rounded-2xl"
            data-testid="button-load-more-bakers"
          >
            Load More Bakers
          </Button>
        </div>
      )}

      {/* Modals */}
      {selectedBaker && showPortfolio && (
        <PortfolioGallery
          baker={selectedBaker}
          onClose={() => {
            setShowPortfolio(false);
            setSelectedBaker(null);
          }}
        />
      )}

      {selectedBaker && showContactModal && (
        <ContactBakerModal
          baker={selectedBaker}
          onClose={() => {
            setShowContactModal(false);
            setSelectedBaker(null);
          }}
        />
      )}
    </div>
  );
}
