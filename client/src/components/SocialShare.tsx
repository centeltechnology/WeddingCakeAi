import { Share2, Facebook, Twitter, Link2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SocialShareProps {
  title?: string;
  description?: string;
  url?: string;
  estimateTotal?: number;
  hashtags?: string[];
}

export default function SocialShare({
  title = "Check out my wedding cake estimate from Wedding CakeAI!",
  description = "I just created my dream wedding cake estimate using AI-powered calculations.",
  url = window.location.href,
  estimateTotal,
  hashtags = ["WeddingCakeAI", "WeddingPlanning", "DreamWedding"]
}: SocialShareProps) {
  const { toast } = useToast();

  const shareText = estimateTotal 
    ? `${description} My estimated cost: $${estimateTotal.toFixed(2)}. ${title}`
    : `${description} ${title}`;

  const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');
  const fullShareText = `${shareText} ${hashtagString}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${url}`);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const shareOnFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${url}`)}`;
    window.open(shareUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-2"
          data-testid="button-share-estimate"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleNativeShare} className="flex items-center space-x-2">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard} className="flex items-center space-x-2">
          <Link2 className="w-4 h-4" />
          <span>Copy Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnFacebook} className="flex items-center space-x-2">
          <Facebook className="w-4 h-4" />
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnTwitter} className="flex items-center space-x-2">
          <Twitter className="w-4 h-4" />
          <span>Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnWhatsApp} className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}