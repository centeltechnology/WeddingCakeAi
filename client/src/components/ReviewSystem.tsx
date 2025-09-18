import { useState } from "react";
import { Star, CheckCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Review, InsertReview } from "@shared/schema";

interface ReviewSystemProps {
  bakerId: string;
  canLeaveReview?: boolean;
}

export function ReviewSystem({ bakerId, canLeaveReview = false }: ReviewSystemProps) {
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['/api/bakers', bakerId, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json() as Review[];
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: (reviewData: InsertReview) => 
      apiRequest('POST', '/api/reviews', reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId, 'reviews'] });
      setIsWritingReview(false);
      setRating(0);
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review will be verified and published soon.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmitReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    submitReviewMutation.mutate({
      bakerId,
      customerName: formData.get('customerName') as string,
      customerEmail: formData.get('customerEmail') as string,
      rating,
      reviewText: formData.get('reviewText') as string,
      weddingDate: formData.get('weddingDate') as string || undefined,
      cakeStyle: formData.get('cakeStyle') as string || undefined,
    });
  };

  const renderStars = (currentRating: number, interactive = false, size = "w-5 h-5") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < currentRating 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300 dark:text-gray-600"
        } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
      />
    ));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, review: Review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review: Review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (isLoading) {
    return (
      <Card data-testid="reviews-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const averageRating = calculateAverageRating();
  const distribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card data-testid="rating-summary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center px-4 md:px-0">
              <div className="text-3xl md:text-4xl font-bold text-amber-600 dark:text-amber-400">
                {averageRating}
              </div>
              <div className="flex justify-center my-2">
                {renderStars(Math.round(parseFloat(averageRating.toString())))}
              </div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{stars}</span>
                  <Star className="w-4 h-4 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ 
                        width: `${reviews.length > 0 ? (distribution[stars as keyof typeof distribution] / reviews.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="w-8 text-right">
                    {distribution[stars as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review Form */}
      {canLeaveReview && (
        <Card data-testid="write-review-card">
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
          </CardHeader>
          <CardContent>
            {!isWritingReview ? (
              <Button 
                onClick={() => setIsWritingReview(true)}
                data-testid="button-write-review"
              >
                Write a Review
              </Button>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-sm font-medium">Your Name *</Label>
                    <Input 
                      id="customerName" 
                      name="customerName" 
                      required 
                      className="h-10"
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="text-sm font-medium">Email *</Label>
                    <Input 
                      id="customerEmail" 
                      name="customerEmail" 
                      type="email" 
                      required 
                      className="h-10"
                      data-testid="input-customer-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rating *</Label>
                  <div className="flex gap-1">
                    {renderStars(hoverRating || rating, true, "w-8 h-8")}
                  </div>
                  {rating === 0 && (
                    <p className="text-sm text-red-500">Please select a rating</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weddingDate" className="text-sm font-medium">Wedding Date</Label>
                    <Input 
                      id="weddingDate" 
                      name="weddingDate" 
                      type="date"
                      className="h-10"
                      data-testid="input-wedding-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cakeStyle" className="text-sm font-medium">Cake Style</Label>
                    <Input 
                      id="cakeStyle" 
                      name="cakeStyle" 
                      placeholder="e.g., 3-tier vanilla with fondant"
                      className="h-10"
                      data-testid="input-cake-style"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewText">Your Review</Label>
                  <Textarea 
                    id="reviewText" 
                    name="reviewText" 
                    placeholder="Tell us about your experience..."
                    rows={4}
                    data-testid="textarea-review-text"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    type="submit" 
                    disabled={rating === 0 || submitReviewMutation.isPending}
                    className="w-full sm:w-auto"
                    data-testid="button-submit-review"
                  >
                    {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsWritingReview(false)}
                    className="w-full sm:w-auto"
                    data-testid="button-cancel-review"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card data-testid="no-reviews">
            <CardContent className="py-8 text-center">
              <Star className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No reviews yet. Be the first to leave a review!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review: Review) => (
            <Card key={review.id} data-testid={`review-${review.id}`}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.customerName}</span>
                        {review.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {review.weddingDate && (
                          <span>Wedding: {new Date(review.weddingDate).toLocaleDateString()}</span>
                        )}
                        {review.cakeStyle && (
                          <>
                            <span>•</span>
                            <span>{review.cakeStyle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {renderStars(review.rating, false, "w-4 h-4")}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(review.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {review.reviewText && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {review.reviewText}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}