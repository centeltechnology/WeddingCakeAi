import { useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Instagram, Youtube, MapPin, Mail, Phone, Loader2, Calculator, Calendar } from 'lucide-react';
import { FaTiktok, FaPinterest } from 'react-icons/fa';

type TenantProfile = {
  id: string;
  tenantId: string;
  displayName: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  about: string | null;
  specialties: string[] | null;
  logoUrl: string | null;
  coverUrl: string | null;
  social: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    pinterest?: string;
  } | null;
};

type MediaAsset = {
  id: string;
  url: string;
  mime: string | null;
  width: number | null;
  height: number | null;
};

type PublicProfileData = {
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
  profile: TenantProfile | null;
  assets: MediaAsset[];
};

export default function MarketplaceListing() {
  const [match, params] = useRoute('/p/:slug');
  const slug = params?.slug || '';
  const bookingEnabled = import.meta.env.VITE_BOOKING_ENABLED === 'true';

  const { data, isLoading, error } = useQuery<PublicProfileData>({
    queryKey: [`/api/public/profile/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/public/profile/${slug}`);
      if (!res.ok) throw new Error('Bakery not found');
      return res.json();
    },
    enabled: !!slug,
  });

  // Build CTA link with UTM tracking
  const ctaLink = bookingEnabled
    ? `/b/${slug}/book?utm_source=marketplace`
    : `/calculator?utm_source=marketplace`;

  const ctaText = bookingEnabled ? 'Request a Consultation' : 'Try Our Calculator';
  const CtaIcon = bookingEnabled ? Calendar : Calculator;

  // SEO meta
  const displayName = data?.profile?.displayName || data?.tenant?.name || 'Bakery';
  const metaDescription = data?.profile?.about
    ? data.profile.about.substring(0, 160)
    : `Visit ${displayName} on BakerIQ - Professional cake pricing and planning`;
  const metaImage = data?.profile?.coverUrl || data?.profile?.logoUrl || '';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Bakery Not Found</h1>
          <p className="text-neutral-600">This bakery profile doesn't exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  const { tenant, profile, assets } = data;

  return (
    <>
      <Helmet>
        <title>{displayName} | BakerIQ Marketplace</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${displayName} | BakerIQ`} />
        <meta property="og:description" content={metaDescription} />
        {metaImage && <meta property="og:image" content={metaImage} />}
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-neutral-50">
        {/* Hero Section */}
        <div className="relative bg-neutral-900 text-white py-16 px-4">
          {profile?.coverUrl && (
            <div
              className="absolute inset-0 opacity-30 bg-cover bg-center"
              style={{ backgroundImage: `url(${profile.coverUrl})` }}
            />
          )}
          <div className="relative container mx-auto max-w-4xl text-center">
            {profile?.logoUrl && (
              <img
                src={profile.logoUrl}
                alt={displayName}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover"
              />
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{displayName}</h1>
            {profile?.address && (
              <p className="flex items-center justify-center gap-2 text-neutral-300 text-lg">
                <MapPin className="w-5 h-5" />
                {profile.address}
              </p>
            )}
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-12 space-y-12">
          {/* CTA Card */}
          <Card className="border-2 border-neutral-900">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
              <p className="text-neutral-600 mb-4">
                {bookingEnabled
                  ? 'Schedule a consultation to discuss your custom cake order'
                  : 'Use our calculator to get an instant estimate for your dream cake'}
              </p>
              <Button
                size="lg"
                onClick={() => (window.location.href = ctaLink)}
                className="gap-2"
              >
                <CtaIcon className="w-5 h-5" />
                {ctaText}
              </Button>
            </CardContent>
          </Card>

          {/* About Section */}
          {profile?.about && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">About</h2>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {profile.about}
              </p>
            </div>
          )}

          {/* Specialties */}
          {profile?.specialties && profile.specialties.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {profile.specialties.map((specialty, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {assets.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="aspect-square rounded-lg overflow-hidden bg-neutral-200">
                    <img
                      src={asset.url}
                      alt="Gallery image"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Get in Touch</h2>
            <div className="space-y-3">
              {profile?.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-3 text-neutral-700 hover:text-neutral-900"
                >
                  <Phone className="w-5 h-5" />
                  {profile.phone}
                </a>
              )}
              {tenant.name && (
                <div className="flex items-center gap-3 text-neutral-700">
                  <Mail className="w-5 h-5" />
                  Contact via BakerIQ
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {profile?.social && Object.values(profile.social).some((v) => v) && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Follow Us</h2>
              <div className="flex gap-4">
                {profile.social.facebook && (
                  <a
                    href={profile.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    <Facebook className="w-6 h-6 text-neutral-700" />
                  </a>
                )}
                {profile.social.instagram && (
                  <a
                    href={profile.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    <Instagram className="w-6 h-6 text-neutral-700" />
                  </a>
                )}
                {profile.social.tiktok && (
                  <a
                    href={profile.social.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    <FaTiktok className="w-6 h-6 text-neutral-700" />
                  </a>
                )}
                {profile.social.youtube && (
                  <a
                    href={profile.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    <Youtube className="w-6 h-6 text-neutral-700" />
                  </a>
                )}
                {profile.social.pinterest && (
                  <a
                    href={profile.social.pinterest}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    <FaPinterest className="w-6 h-6 text-neutral-700" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
