import { useState } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, X, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useUpgradePrompt } from '@/hooks/useUpgradePrompt';
import { parseSubscriptionError } from '@/lib/subscriptionUtils';
// Removed Uppy imports
import type { Baker } from "@shared/schema";

interface PortfolioUploaderProps {
  bakerId: string;
}

export default function PortfolioUploader({ bakerId }: PortfolioUploaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { showUpgradePrompt, UpgradePromptComponent } = useUpgradePrompt();

  const { data: baker, isLoading } = useQuery<Baker>({
    queryKey: ['/api/bakers', bakerId],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}`);
      if (!response.ok) throw new Error('Failed to fetch baker');
      return response.json();
    }
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: async (portfolioImageURL: string) => {
      console.log('Sending portfolio request with URL:', portfolioImageURL);
      const { makeAuthenticatedRequest } = await import('@/lib/csrf');
      const response = await makeAuthenticatedRequest(`/api/bakers/${bakerId}/portfolio`, {
        method: 'POST',
        body: JSON.stringify({ portfolioImageURL })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update portfolio' }));
        throw new Error(errorData.error || 'Failed to update portfolio');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId] });
      toast({
        title: "Portfolio Updated",
        description: "Your portfolio image has been added successfully!",
      });
    },
    onError: (error) => {
      console.error('Portfolio upload error:', error);
      
      // Check if it's a subscription error
      const subscriptionError = parseSubscriptionError(error);
      if (subscriptionError) {
        showUpgradePrompt(
          error, 
          'portfolio_management', 
          'Portfolio Limit Reached'
        );
        return;
      }

      // Show generic error for other failures
      toast({
        title: "Upload Failed",
        description: "Failed to update portfolio. Please try again.",
        variant: "destructive",
      });
    }
  });

  const removePortfolioMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const { makeAuthenticatedRequest } = await import('@/lib/csrf');
      const response = await makeAuthenticatedRequest(`/api/bakers/${bakerId}/portfolio`, {
        method: 'DELETE',
        body: JSON.stringify({ portfolioImageURL: imageUrl })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to remove portfolio image' }));
        throw new Error(errorData.error || 'Failed to remove portfolio image');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId] });
      toast({
        title: "Image Removed",
        description: "Portfolio image has been removed successfully!",
      });
    }
  });

  const handleGetUploadParameters = async () => {
    const { makeAuthenticatedRequest } = await import('@/lib/csrf');
    const response = await makeAuthenticatedRequest('/api/objects/upload', {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get upload URL' }));
      throw new Error(errorData.error || 'Failed to get upload URL');
    }
    const { uploadURL } = await response.json();
    return {
      method: 'PUT' as const,
      url: uploadURL,
    };
  };

  const handleComplete = (result: { successful: Array<{ uploadURL: string }> }) => {
    console.log('Portfolio upload complete result:', result);
    if (result.successful && result.successful.length > 0) {
      // Process all uploaded images
      result.successful.forEach((upload, index) => {
        const uploadURL = upload.uploadURL as string;
        console.log(`Processing upload ${index + 1}/${result.successful.length}:`, uploadURL);
        setTimeout(() => {
          updatePortfolioMutation.mutate(uploadURL);
        }, index * 500); // Stagger API calls by 500ms to avoid overwhelming the server
      });
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    removePortfolioMutation.mutate(imageUrl);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-muted-foreground">Loading portfolio...</p>
      </div>
    );
  }

  const portfolio = baker?.portfolio || [];
  const maxImages = 20; // Set a reasonable limit

  return (
    <div className="space-y-6">
      {/* Upgrade Prompt */}
      <UpgradePromptComponent />
      <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-100 to-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-serif font-bold text-gray-900">Portfolio Management</h3>
              <p className="text-gray-800">Showcase your best cake creations</p>
            </div>
            <Badge className="bg-primary/10 text-primary">
              {portfolio.length}/{maxImages} Images
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          {portfolio.length < maxImages && (
            <div className="border-2 border-dashed border-primary/20 rounded-2xl p-8 text-center bg-primary/5">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Add Portfolio Images</h4>
              <p className="text-gray-800 mb-6">
                Upload high-quality photos of your wedding cakes to attract more customers
              </p>
              <ObjectUploader
                maxNumberOfFiles={Math.min(5, maxImages - portfolio.length)}
                maxFileSize={5242880} // 5MB
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleComplete}
                buttonClassName="w-full h-16 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg border-2 border-pink-400 hover:border-pink-300"
              >
                <Upload className="w-6 h-6 mr-3 text-white" />
                <span className="text-white font-bold">📸 Upload Portfolio Images</span>
              </ObjectUploader>
              <p className="text-xs text-gray-800 mt-3 font-medium">
                Supported formats: JPG, PNG (Max 5MB each) • Select up to {Math.min(5, maxImages - portfolio.length)} images at once
              </p>
            </div>
          )}

          {/* Portfolio Grid */}
          {portfolio.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-gray-900" />
                Your Portfolio ({portfolio.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map((imageUrl, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gray-100/80">
                    <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                      <img
                        src={imageUrl}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        data-testid={`portfolio-image-${index}`}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                          onClick={() => window.open(imageUrl, '_blank')}
                          data-testid={`button-view-image-${index}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-red-500/80 hover:bg-red-500 text-white border border-red-400"
                          onClick={() => handleRemoveImage(imageUrl)}
                          disabled={removePortfolioMutation.isPending}
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {portfolio.length === 0 && (
            <div className="text-center py-12 text-gray-800">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-70 text-gray-700" />
              <p className="font-medium">No portfolio images yet. Upload your first cake photo to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}