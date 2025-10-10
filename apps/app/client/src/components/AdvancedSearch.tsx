import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Star, DollarSign, Award, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Baker } from "@shared/schema";

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export interface SearchFilters {
  location?: string;
  radius?: number;
  specialty?: string;
  priceRange?: string;
  rating?: number;
  dietary?: string;
  experience?: number;
  teamSize?: number;
  leadTime?: string;
  certifications?: string[];
}

const specialtyOptions = [
  "Wedding Specialist",
  "Custom Designs", 
  "Fondant Expert",
  "Buttercream Specialist",
  "Sugar Flowers",
  "Naked Cakes",
  "Tiered Cakes",
  "Cupcake Towers",
  "Dessert Tables"
];

const dietaryOptions = [
  "Gluten-Free",
  "Vegan",
  "Keto",
  "Sugar-Free",
  "Nut-Free",
  "Dairy-Free",
  "Organic"
];

const certificationOptions = [
  "Food Safety Certified",
  "Professional Pastry Chef",
  "Culinary Arts Degree",
  "Wedding Cake Specialist",
  "Sugar Art Certified",
  "Business Licensed"
];

const priceRanges = [
  { value: "budget", label: "$3-8/serving", min: 3, max: 8 },
  { value: "mid", label: "$8-15/serving", min: 8, max: 15 },
  { value: "premium", label: "$15-25/serving", min: 15, max: 25 },
  { value: "luxury", label: "$25+/serving", min: 25, max: 50 }
];

const leadTimeOptions = [
  "1-2 weeks",
  "2-4 weeks", 
  "1-2 months",
  "2+ months"
];

export function AdvancedSearch({ onSearch, isLoading = false }: AdvancedSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
  };

  const updateActiveFilters = (currentFilters: SearchFilters) => {
    const active: string[] = [];
    
    if (currentFilters.location) active.push(`Location: ${currentFilters.location}`);
    if (currentFilters.radius) active.push(`${currentFilters.radius} miles`);
    if (currentFilters.specialty && currentFilters.specialty !== 'all') {
      active.push(`Specialty: ${currentFilters.specialty}`);
    }
    if (currentFilters.priceRange && currentFilters.priceRange !== 'all') {
      const range = priceRanges.find(r => r.value === currentFilters.priceRange);
      active.push(`Price: ${range?.label}`);
    }
    if (currentFilters.rating) active.push(`${currentFilters.rating}+ stars`);
    if (currentFilters.dietary && currentFilters.dietary !== 'all') {
      active.push(`Dietary: ${currentFilters.dietary}`);
    }
    if (currentFilters.experience) active.push(`${currentFilters.experience}+ years exp.`);
    if (currentFilters.teamSize) active.push(`Team: ${currentFilters.teamSize}+ people`);
    if (currentFilters.leadTime) active.push(`Lead time: ${currentFilters.leadTime}`);
    if (currentFilters.certifications?.length) {
      active.push(`${currentFilters.certifications.length} certification${currentFilters.certifications.length > 1 ? 's' : ''}`);
    }

    setActiveFilters(active);
  };

  const handleSearch = () => {
    onSearch(filters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilters({});
    setActiveFilters([]);
    onSearch({});
  };

  const removeFilter = (filterText: string) => {
    const newFilters = { ...filters };
    
    if (filterText.startsWith('Location:')) {
      delete newFilters.location;
    } else if (filterText.includes('miles')) {
      delete newFilters.radius;
    } else if (filterText.startsWith('Specialty:')) {
      delete newFilters.specialty;
    } else if (filterText.startsWith('Price:')) {
      delete newFilters.priceRange;
    } else if (filterText.includes('stars')) {
      delete newFilters.rating;
    } else if (filterText.startsWith('Dietary:')) {
      delete newFilters.dietary;
    } else if (filterText.includes('years exp')) {
      delete newFilters.experience;
    } else if (filterText.startsWith('Team:')) {
      delete newFilters.teamSize;
    } else if (filterText.startsWith('Lead time:')) {
      delete newFilters.leadTime;
    } else if (filterText.includes('certification')) {
      delete newFilters.certifications;
    }
    
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onSearch(newFilters);
  };

  const toggleCertification = (cert: string) => {
    const current = filters.certifications || [];
    const updated = current.includes(cert)
      ? current.filter(c => c !== cert)
      : [...current, cert];
    
    updateFilter('certifications', updated.length ? updated : undefined);
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <Card data-testid="search-header">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Location Search */}
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Enter city, state, or zip code..."
                  className="pl-10 h-10 md:h-9"
                  value={filters.location || ''}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  data-testid="input-location"
                />
              </div>
            </div>

            {/* Search Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto" data-testid="button-filters">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {activeFilters.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-filters">
                  <DialogHeader>
                    <DialogTitle>Advanced Filters</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Location & Distance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Search Radius</Label>
                        <div className="space-y-2 px-2">
                          <Slider
                            value={[filters.radius || 25]}
                            onValueChange={([value]) => updateFilter('radius', value)}
                            max={100}
                            min={5}
                            step={5}
                            data-testid="slider-radius"
                          />
                          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                            {filters.radius || 25} miles
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Minimum Rating</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[filters.rating || 0]}
                            onValueChange={([value]) => updateFilter('rating', value)}
                            max={5}
                            min={0}
                            step={0.5}
                            data-testid="slider-rating"
                          />
                          <div className="text-sm text-gray-600 dark:text-gray-400 text-center flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            {filters.rating || 0}+ stars
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Specialty & Dietary */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Specialty</Label>
                        <Select value={filters.specialty || 'all'} onValueChange={(value) => updateFilter('specialty', value === 'all' ? undefined : value)}>
                          <SelectTrigger data-testid="select-specialty">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Specialties</SelectItem>
                            {specialtyOptions.map(specialty => (
                              <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Dietary Options</Label>
                        <Select value={filters.dietary || 'all'} onValueChange={(value) => updateFilter('dietary', value === 'all' ? undefined : value)}>
                          <SelectTrigger data-testid="select-dietary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Options</SelectItem>
                            {dietaryOptions.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Price Range</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {priceRanges.map(range => (
                          <Button
                            key={range.value}
                            variant={filters.priceRange === range.value ? "default" : "outline"}
                            size="sm"
                            className="text-xs md:text-sm h-8 md:h-9"
                            onClick={() => updateFilter('priceRange', filters.priceRange === range.value ? undefined : range.value)}
                            data-testid={`button-price-${range.value}`}
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            <span className="truncate">{range.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Experience & Team Size */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Minimum Experience</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[filters.experience || 0]}
                            onValueChange={([value]) => updateFilter('experience', value === 0 ? undefined : value)}
                            max={20}
                            min={0}
                            step={1}
                            data-testid="slider-experience"
                          />
                          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            {filters.experience || 0}+ years
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Minimum Team Size</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[filters.teamSize || 0]}
                            onValueChange={([value]) => updateFilter('teamSize', value === 0 ? undefined : value)}
                            max={10}
                            min={0}
                            step={1}
                            data-testid="slider-team-size"
                          />
                          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            {filters.teamSize || 0}+ people
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lead Time */}
                    <div className="space-y-2">
                      <Label>Lead Time</Label>
                      <Select value={filters.leadTime || ''} onValueChange={(value) => updateFilter('leadTime', value || undefined)}>
                        <SelectTrigger data-testid="select-lead-time">
                          <SelectValue placeholder="Select lead time preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any lead time</SelectItem>
                          {leadTimeOptions.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-2">
                      <Label>Required Certifications</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {certificationOptions.map(cert => (
                          <div key={cert} className="flex items-center space-x-2">
                            <Checkbox
                              id={cert}
                              checked={(filters.certifications || []).includes(cert)}
                              onCheckedChange={() => toggleCertification(cert)}
                              data-testid={`checkbox-${cert.toLowerCase().replace(/\s+/g, '-')}`}
                            />
                            <Label htmlFor={cert} className="text-sm font-normal">
                              <Award className="w-3 h-3 inline mr-1" />
                              {cert}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
                        Clear All
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsFilterOpen(false)} data-testid="button-cancel">
                          Cancel
                        </Button>
                        <Button onClick={handleSearch} data-testid="button-apply-filters">
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full sm:w-auto"
                data-testid="button-search"
              >
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Card data-testid="active-filters">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active filters:
              </span>
              {activeFilters.map((filter, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20"
                  onClick={() => removeFilter(filter)}
                  data-testid={`filter-badge-${index}`}
                >
                  {filter}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-6"
                data-testid="button-clear-all-filters"
              >
                Clear all
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}