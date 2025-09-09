import { useState, useEffect } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Phone, Globe, Instagram, Facebook, Filter, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Baker } from "@shared/schema";

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  const { data: bakers = [], isLoading } = useQuery({
    queryKey: ["/api/bakers/public"],
  });

  const filteredBakers = bakers.filter((baker: Baker) => {
    const matchesSearch = 
      baker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      baker.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      baker.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      baker.address?.toLowerCase().includes(locationFilter.toLowerCase());
    
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
                placeholder="Location (city, zip)"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
                data-testid="input-location-filter"
              />
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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? "Loading..." : `${sortedBakers.length} baker${sortedBakers.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Baker Cards Grid */}
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
                      <Button size="sm" data-testid={`button-get-quote-${baker.id}`}>
                        Get Quote
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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