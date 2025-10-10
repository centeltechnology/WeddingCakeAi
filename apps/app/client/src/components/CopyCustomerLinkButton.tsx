import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Link2, Check } from "lucide-react";

interface CopyCustomerLinkButtonProps {
  entity: "quote" | "contract" | "invoice";
  entityId: string;
  variant?: "primary" | "secondary" | "outline" | "outline-light" | "ghost" | "danger" | "success";
  className?: string;
}

export function CopyCustomerLinkButton({ 
  entity, 
  entityId, 
  variant = "outline",
  className = ""
}: CopyCustomerLinkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portal/token/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ entity, entityId })
      });

      if (!res.ok) {
        throw new Error('Failed to generate customer link');
      }

      const data = await res.json();
      
      // Copy to clipboard
      await navigator.clipboard.writeText(data.url);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error generating customer link:', error);
      alert('Failed to generate customer link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleCopyLink}
      disabled={loading || copied}
      className={className}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4 mr-2" />
          {loading ? 'Generating...' : 'Copy Customer Link'}
        </>
      )}
    </Button>
  );
}
