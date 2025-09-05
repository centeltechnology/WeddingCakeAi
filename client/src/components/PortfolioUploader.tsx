import { useState } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, X, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";
import type { Baker } from "@shared/schema";

interface PortfolioUploaderProps {
  bakerId: string;
}

export default function PortfolioUploader({ bakerId }: PortfolioUploaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const response = await fetch(`/api/bakers/${bakerId}/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioImageURL })
      });
      if (!response.ok) throw new Error('Failed to update portfolio');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId] });
      toast({
        title: "Portfolio Updated",
        description: "Your portfolio image has been added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to update portfolio. Please try again.",
        variant: "destructive",
      });
    }
  });

  const removePortfolioMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await fetch(`/api/bakers/${bakerId}/portfolio`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioImageURL: imageUrl })
      });
      if (!response.ok) throw new Error('Failed to remove portfolio image');
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
    const response = await fetch('/api/objects/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to get upload URL');
    const { uploadURL } = await response.json();
    return {
      method: 'PUT' as const,
      url: uploadURL,
    };
  };

  const handleComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL as string;
      updatePortfolioMutation.mutate(uploadURL);
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
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-white/95">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-serif font-bold text-foreground">Portfolio Management</h3>
              <p className="text-muted-foreground">Showcase your best cake creations</p>
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
              <h4 className="text-lg font-semibold text-foreground mb-2">Add Portfolio Images</h4>
              <p className="text-muted-foreground mb-6">
                Upload high-quality photos of your wedding cakes to attract more customers
              </p>
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={5242880} // 5MB
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleComplete}
                buttonClassName="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Image
              </ObjectUploader>
              <p className="text-xs text-muted-foreground mt-3">
                Supported formats: JPG, PNG (Max 5MB)
              </p>
            </div>
          )}

          {/* Portfolio Grid */}
          {portfolio.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Your Portfolio ({portfolio.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map((imageUrl, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/50">
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
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No portfolio images yet. Upload your first cake photo to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}