import { useState } from "react";
import { useParams } from "wouter";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Star, Phone, Globe, Instagram, Facebook, 
  Clock, DollarSign, Award, Users, Calendar, MessageSquare 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Baker } from "@shared/schema";
import { BookingCalendar } from "@/components/BookingCalendar";

export default function BakerProfile() {
  const params = useParams();
  const bakerId = params.id;

  const { data: baker, isLoading } = useQuery<Baker>({
    queryKey: [`/api/bakers/${bakerId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
        <NavigationHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!baker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
        <NavigationHeader />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Baker Not Found</h1>
          <p className="text-gray-600 mb-8">The baker you're looking for doesn't exist or has been removed.</p>
          <Link href="/marketplace">
            <Button>Browse All Bakers</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xl font-bold">
                {baker.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                    {baker.businessName || baker.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">by {baker.name}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {baker.rating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{baker.rating}</span>
                        <span className="ml-1">(127 reviews)</span>
                      </div>
                    )}
                    {baker.address && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{baker.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:items-end gap-2">
                  {baker.priceRange && (
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{baker.priceRange}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/baker/${baker.id}/calculator`}>
                      <Button size="sm" data-testid="button-get-quote">
                        Get Quote
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" data-testid="button-book-consultation">
                      Book Consultation
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Contact & Social */}
              <div className="flex flex-wrap gap-2">
                {baker.phone && (
                  <Button size="sm" variant="outline" className="h-8" data-testid="button-phone">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                )}
                {baker.socialMedia?.website && (
                  <Button size="sm" variant="outline" className="h-8" data-testid="button-website">
                    <Globe className="h-4 w-4 mr-1" />
                    Website
                  </Button>
                )}
                {baker.socialMedia?.instagram && (
                  <Button size="sm" variant="outline" className="h-8" data-testid="button-instagram">
                    <Instagram className="h-4 w-4 mr-1" />
                    Instagram
                  </Button>
                )}
                {baker.socialMedia?.facebook && (
                  <Button size="sm" variant="outline" className="h-8" data-testid="button-facebook">
                    <Facebook className="h-4 w-4 mr-1" />
                    Facebook
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="portfolio" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="specialties">Specialties</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Work</CardTitle>
                    <CardDescription>Browse our latest cake creations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {baker.portfolio && baker.portfolio.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {baker.portfolio.map((image: string, index: number) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image} 
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-64 object-cover rounded-lg transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button variant="secondary" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Portfolio coming soon!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {baker.businessName || baker.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {baker.description || "This talented baker brings creativity and passion to every cake creation."}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Business Hours
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Monday - Friday</span>
                            <span>9:00 AM - 6:00 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Saturday</span>
                            <span>10:00 AM - 4:00 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sunday</span>
                            <span>By Appointment</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Service Area
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Within 50 miles of {baker.address?.split(',')[1] || 'our location'}</p>
                          <p>Delivery available for orders over $200</p>
                          <p>Setup service included for wedding cakes</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="specialties" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Specialties & Services</CardTitle>
                    <CardDescription>What we excel at</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Cake Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {baker.specialties?.map((specialty: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {specialty}
                            </Badge>
                          )) || (
                            <p className="text-gray-500">No specialties listed</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Additional Services</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Custom cake design consultations</li>
                          <li>• Cake tasting appointments</li>
                          <li>• Wedding cake delivery & setup</li>
                          <li>• Corporate event catering</li>
                          <li>• Cake decorating classes</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>What our clients say</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Sample reviews */}
                      <div className="border-b pb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 text-yellow-500 fill-current" />
                              ))}
                            </div>
                            <span className="ml-2 font-medium">Sarah Johnson</span>
                          </div>
                          <span className="text-sm text-gray-500">2 weeks ago</span>
                        </div>
                        <p className="text-gray-700">
                          "Absolutely stunning wedding cake! The design exceeded our expectations and the taste was incredible. 
                          Everyone at our reception couldn't stop raving about it."
                        </p>
                      </div>
                      
                      <div className="border-b pb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 text-yellow-500 fill-current" />
                              ))}
                            </div>
                            <span className="ml-2 font-medium">Michael Chen</span>
                          </div>
                          <span className="text-sm text-gray-500">1 month ago</span>
                        </div>
                        <p className="text-gray-700">
                          "Professional service from start to finish. The consultation was thorough and the final cake was 
                          exactly what we envisioned. Highly recommend!"
                        </p>
                      </div>
                      
                      <Button variant="outline" className="w-full" data-testid="button-see-all-reviews">
                        See All Reviews
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Calendar */}
            <BookingCalendar 
              baker={baker} 
              onBookingComplete={(consultationId) => {
                console.log('Consultation booked:', consultationId);
              }} 
            />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/baker/${baker.id}/calculator`}>
                  <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold" data-testid="button-get-quote-sidebar">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Get Price Quote
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full border-rose-300 text-rose-600 hover:bg-rose-50" 
                  data-testid="button-send-message"
                  onClick={() => {
                    const subject = encodeURIComponent(`Inquiry about ${baker.businessName || baker.name}`);
                    const body = encodeURIComponent(`Hi ${baker.name},\n\nI'm interested in your cake services and would like to discuss my upcoming event.\n\nBest regards`);
                    if (baker.email) {
                      window.location.href = `mailto:${baker.email}?subject=${subject}&body=${body}`;
                    } else {
                      alert('Contact information not available. Please use the phone number to reach this baker.');
                    }
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
            
            {/* Baker Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Baker Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">Within 2 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Orders</span>
                  <span className="font-medium">450+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Years Experience</span>
                  <span className="font-medium">8 years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Repeat Customers</span>
                  <span className="font-medium">85%</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Service Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">{baker.address}</p>
                      <p className="text-sm text-gray-500">Serves 50 mile radius</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-rose-300 text-rose-600 hover:bg-rose-50"
                    data-testid="button-view-on-map"
                    onClick={() => {
                      if (baker.address) {
                        const encodedAddress = encodeURIComponent(baker.address);
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                      } else {
                        alert('Address not available for this baker.');
                      }
                    }}
                  >
                    View on Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}