import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

export default function SEOHead({
  title = "Wedding CakeAI - AI-Powered Wedding Cake Calculator & Baker Directory",
  description = "Plan your perfect wedding cake with AI-powered cost estimation, baker discovery, and cake visualization. Get instant pricing for custom wedding cakes and connect with trusted local bakers.",
  image = "/og-image.jpg",
  url = "https://weddingcakeai.com",
  type = "website",
  keywords = "wedding cake calculator, wedding cake cost, cake pricing, wedding baker, cake estimate, AI cake design, wedding planning, custom wedding cake"
}: SEOHeadProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: string) => {
      let tag = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        if (property) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'Wedding CakeAI');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph meta tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', 'Wedding CakeAI', 'property');

    // Twitter meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Additional meta tags for better SEO
    updateMetaTag('theme-color', '#B8860B');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
    updateMetaTag('apple-mobile-web-app-title', 'Wedding CakeAI');

    // Structured data for rich snippets
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Wedding CakeAI",
      "url": url,
      "description": description,
      "applicationCategory": "Wedding Planning",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "2500",
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Organization",
        "name": "Wedding CakeAI",
        "url": url
      },
      "provider": {
        "@type": "Organization",
        "name": "Wedding CakeAI",
        "url": url
      }
    };

    // Add structured data script
    let structuredDataScript = document.querySelector('#structured-data') as HTMLScriptElement;
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.id = 'structured-data';
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);

  }, [title, description, image, url, type, keywords]);

  return null;
}