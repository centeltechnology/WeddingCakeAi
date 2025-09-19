import { useState } from "react";
import { useParams } from "wouter";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Star, Phone, Globe, Instagram, Facebook, 
  Clock, DollarSign, Award, Users, Calendar, MessageSquare, Check
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Baker, Review, InsertReview } from "@shared/schema";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema } from "@shared/schema";
import { format } from "date-fns";

export default function BakerProfile() {
  const params = useParams();
  const bakerId = params.id;
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      data-testid="button-book-consultation"
                      onClick={() => {
                        document.getElementById('booking-calendar')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Book Consultation
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Contact & Social */}
              <div className="flex flex-wrap gap-2">
                {baker.phone && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8" 
                    data-testid="button-phone"
                    onClick={() => window.location.href = `tel:${baker.phone}`}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                )}
                {baker.socialMedia?.website && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8" 
                    data-testid="button-website"
                    onClick={() => {
                      const website = baker.socialMedia?.website;
                      if (website) {
                        const url = website.startsWith('http') ? website : `https://${website}`;
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Website
                  </Button>
                )}
                {baker.socialMedia?.instagram && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8" 
                    data-testid="button-instagram"
                    onClick={() => window.open(`https://instagram.com/${baker.socialMedia?.instagram?.replace('@', '')}`, '_blank')}
                  >
                    <Instagram className="h-4 w-4 mr-1" />
                    Instagram
                  </Button>
                )}
                {baker.socialMedia?.facebook && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8" 
                    data-testid="button-facebook"
                    onClick={() => window.open(`https://facebook.com/${baker.socialMedia?.facebook?.replace('@', '')}`, '_blank')}
                  >
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
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => setSelectedImage(image)}
                                data-testid={`button-view-details-${index}`}
                              >
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
                        <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {baker.specialties && baker.specialties.length > 0 ? (
                            baker.specialties.map((specialty: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {specialty}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No specialties listed</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Cake Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {baker.cakeTypes && baker.cakeTypes.length > 0 ? (
                            baker.cakeTypes.map((cakeType: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {cakeType}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No cake types listed</p>
                          )}
                        </div>
                      </div>
                      
                      {baker.services && baker.services.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-900 mb-3">Additional Services</h4>
                          <div className="flex flex-wrap gap-2">
                            {baker.services.map((service: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                <ReviewsSection bakerId={baker.id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Calendar */}
            <div id="booking-calendar">
              <BookingCalendar 
                baker={baker} 
                onBookingComplete={(consultationId) => {
                  console.log('Consultation booked:', consultationId);
                }} 
              />
            </div>
            
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
                      {baker.pricing?.deliverySettings?.deliveryRadius && (
                        <p className="text-sm text-gray-500">
                          Serves {baker.pricing.deliverySettings.deliveryRadius} mile radius
                        </p>
                      )}
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
      
      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={selectedImage} 
              alt="Portfolio Details"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              data-testid="button-close-image"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Reviews Section Component
function ReviewsSection({ bakerId }: { bakerId: string }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reviews for this baker
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/bakers/${bakerId}/reviews`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/bakers/${bakerId}/reviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return await response.json();
    },
  });

  // Form for submitting new reviews
  const form = useForm<InsertReview>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: {
      bakerId,
      customerName: "",
      customerEmail: "",
      rating: 5,
      reviewText: "",
      cakeStyle: "",
      isVerified: false,
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: InsertReview) => {
      const response = await apiRequest('POST', '/api/reviews', reviewData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback. Your review will be verified and published shortly.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/bakers/${bakerId}/reviews`] });
      setShowReviewForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Submit Review",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitReview = (data: InsertReview) => {
    submitReviewMutation.mutate({
      ...data,
      bakerId,
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (reviewsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border-b pb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>
              {reviews.length > 0 
                ? `${reviews.length} review${reviews.length > 1 ? 's' : ''} from happy customers`
                : "Be the first to leave a review!"
              }
            </CardDescription>
          </div>
          
          <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-write-review">
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your experience with this baker to help other customers make informed decisions.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <Select value={String(field.value)} onValueChange={(value) => field.onChange(parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 Stars - Excellent</SelectItem>
                              <SelectItem value="4">4 Stars - Very Good</SelectItem>
                              <SelectItem value="3">3 Stars - Good</SelectItem>
                              <SelectItem value="2">2 Stars - Fair</SelectItem>
                              <SelectItem value="1">1 Star - Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cakeStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cake Style (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Wedding Cake, Birthday Cake" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reviewText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your experience with this baker..."
                            className="min-h-24"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={submitReviewMutation.isPending}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                      data-testid="button-submit-review"
                    >
                      {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No reviews yet</p>
            <p className="text-sm">Be the first to share your experience with this baker!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {renderStars(review.rating)}
                    <span className="font-medium">{review.customerName}</span>
                    {review.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(review.createdAt || ''), 'MMM d, yyyy')}
                  </span>
                </div>
                
                {review.cakeStyle && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Style:</strong> {review.cakeStyle}
                  </p>
                )}
                
                {review.reviewText && (
                  <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}