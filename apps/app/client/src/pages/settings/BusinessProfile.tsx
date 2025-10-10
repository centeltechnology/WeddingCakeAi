import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Save, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SettingsTabs } from '@/components/SettingsTabs';

interface TenantProfile {
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
  createdAt: string;
  updatedAt: string;
}

export default function BusinessProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [about, setAbout] = useState('');
  const [specialtiesText, setSpecialtiesText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Load profile
  const { data: profile, isLoading } = useQuery<TenantProfile | null>({
    queryKey: ['/api/me/profile'],
    queryFn: async () => {
      const data = await apiRequest('GET', '/api/me/profile', undefined);
      return data as TenantProfile | null;
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPhone(profile.phone || '');
      setWebsite(profile.website || '');
      setAddress(profile.address || '');
      setAbout(profile.about || '');
      setSpecialtiesText(profile.specialties?.join(', ') || '');
      setLogoUrl(profile.logoUrl || '');
      setCoverUrl(profile.coverUrl || '');
    }
  }, [profile]);

  // Save profile
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/me/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me/profile'] });
      toast({
        title: 'Profile Saved',
        description: 'Your business profile has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Unable to save profile',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    // Convert CSV to array
    const specialties = specialtiesText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    saveMutation.mutate({
      displayName,
      phone,
      website,
      address,
      about,
      specialties,
      logoUrl,
      coverUrl,
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader
          title="Settings"
          subtitle="Manage your calculator and business profile settings"
        />

        <SettingsTabs />

        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Business Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Sweet Dreams Bakery"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City, State 12345"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About & Specialties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="about">About Your Business</Label>
                <Textarea
                  id="about"
                  placeholder="Tell customers about your bakery, your story, and what makes you special..."
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This will be displayed on your public profile
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties & Services</Label>
                <Textarea
                  id="specialties"
                  placeholder="Wedding cakes, Custom designs, Gluten-free options, Delivery available"
                  rows={3}
                  value={specialtiesText}
                  onChange={(e) => setSpecialtiesText(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter specialties separated by commas. They'll appear as chips on your profile.
                </p>
                {specialtiesText && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {specialtiesText.split(',').map((item, idx) => {
                      const trimmed = item.trim();
                      return trimmed ? (
                        <Badge key={idx} variant="secondary">
                          {trimmed}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Current logo: {logoUrl || 'None'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverUrl">Cover Image URL</Label>
                <Input
                  id="coverUrl"
                  type="url"
                  placeholder="https://example.com/cover.png"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Current cover: {coverUrl || 'None'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  📸 Image uploader will be added in the next update. For now, upload images to your hosting and paste the URLs here.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
