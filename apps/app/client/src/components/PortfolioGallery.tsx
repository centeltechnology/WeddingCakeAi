import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Eye, ZoomIn, Star } from "lucide-react";
import type { Baker } from "@shared/schema";

interface PortfolioGalleryProps {
  baker: Baker;
  onClose: () => void;
}

export default function PortfolioGallery({ baker, onClose }: PortfolioGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const portfolio = baker.portfolio || [];

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  if (portfolio.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto bg-card dark:bg-card">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Portfolio Yet</h3>
            <p className="text-muted-foreground mb-6">
              This baker hasn't uploaded any portfolio images yet.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/10 z-60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎂</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{baker.name}</h2>
              <div className="flex items-center space-x-3">
                <Badge className="bg-white/10 text-white border-white/20">
                  {portfolio.length} Images
                </Badge>
                {baker.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm">{baker.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10 border border-white/20"
            data-testid="button-close-portfolio"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {portfolio.map((imageUrl, index) => (
            <Card
              key={index}
              className="group cursor-pointer overflow-hidden border-0 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
              onClick={() => handleImageClick(imageUrl)}
              data-testid={`portfolio-card-${index}`}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`${baker.name} cake ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-70 flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size cake"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              loading="eager"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.alt = 'Image failed to load';
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 border border-white/20"
              data-testid="button-close-full-image"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}