import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Save, Building2, Image as ImageIcon, X, Plus, Facebook, Instagram, Youtube, Eye, EyeOff, Link2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SettingsTabs } from '@/components/SettingsTabs';
import SaveBar from '@/components/SaveBar';
import PreviewButtons from '@/components/PreviewButtons';
import { Switch } from '@/components/ui/switch';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  pinterest?: string;
}

interface TenantProfile {
  id?: string;
  tenantId?: string;
  displayName: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  about: string | null;
  specialties: string[] | null;
  logoUrl: string | null;
  coverUrl: string | null;
  social: SocialLinks | null;
  isPublished?: boolean;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function BusinessProfile({ embedded = false }: { embedded?: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [about, setAbout] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [slug, setSlug] = useState('');
  const [social, setSocial] = useState<SocialLinks>({
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    pinterest: ''
  });

  // Load profile
  const { data: profile, isLoading } = useQuery<TenantProfile | null>({
    queryKey: ['/api/me/profile'],
    queryFn: async () => {
      const data = await apiRequest('GET', '/api/me/profile', undefined);
      return data as unknown as TenantProfile | null;
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
      setSpecialties(profile.specialties || []);
      setLogoUrl(profile.logoUrl || '');
      setCoverUrl(profile.coverUrl || '');
      setIsPublished(profile.isPublished || false);
      setSlug(profile.slug || '');
      setSocial({
        facebook: profile.social?.facebook || '',
        instagram: profile.social?.instagram || '',
        tiktok: profile.social?.tiktok || '',
        youtube: profile.social?.youtube || '',
        pinterest: profile.social?.pinterest || ''
      });
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
      const errorMessage = error.message || error.error || 'Unable to save profile';
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Compute dirty state - treat missing profile as empty baseline
  const isDirty = useMemo(() => {
    // Allow saving when user enters data, even if no profile exists yet
    const hasSocialData = !!(social.facebook || social.instagram || social.tiktok || social.youtube || social.pinterest);
    const hasData = !!(displayName || phone || website || address || about || specialties.length || logoUrl || coverUrl || slug || hasSocialData);
    if (!profile) return hasData;
    
    const profileSocial = {
      facebook: profile.social?.facebook || '',
      instagram: profile.social?.instagram || '',
      tiktok: profile.social?.tiktok || '',
      youtube: profile.social?.youtube || '',
      pinterest: profile.social?.pinterest || ''
    };
    return (
      displayName !== (profile.displayName || '') ||
      phone !== (profile.phone || '') ||
      website !== (profile.website || '') ||
      address !== (profile.address || '') ||
      about !== (profile.about || '') ||
      JSON.stringify(specialties) !== JSON.stringify(profile.specialties || []) ||
      logoUrl !== (profile.logoUrl || '') ||
      coverUrl !== (profile.coverUrl || '') ||
      isPublished !== (profile.isPublished || false) ||
      slug !== (profile.slug || '') ||
      JSON.stringify(social) !== JSON.stringify(profileSocial)
    );
  }, [profile, displayName, phone, website, address, about, specialties, logoUrl, coverUrl, isPublished, slug, social]);

  const handleSave = () => {
    saveMutation.mutate({
      displayName,
      phone,
      website,
      address,
      about,
      specialties,
      logoUrl,
      coverUrl,
      isPublished,
      slug,
      social,
    });
  };

  const addSpecialty = () => {
    const trimmed = newSpecialty.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      setSpecialties([...specialties, trimmed]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  const handleSpecialtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  if (isLoading) {
    const loadingContent = (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );

    if (embedded) {
      return loadingContent;
    }

    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          {loadingContent}
        </div>
      </AppLayout>
    );
  }

  const content = (
    <div className="space-y-6">
          <Card className={isPublished ? "border-primary/50 bg-primary/5" : "border-muted"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isPublished ? <Eye className="w-5 h-5 text-primary" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
                Public Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label htmlFor="isPublished" className="text-base font-semibold cursor-pointer">
                      {isPublished ? 'Profile Published' : 'Profile Unpublished'}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isPublished 
                      ? 'Your profile is publicly visible and can be found by customers'
                      : 'Your profile is hidden from public view until you publish it'}
                  </p>
                </div>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Profile URL Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="your-bakery-name"
                    className="font-mono"
                  />
                  {slug && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.open(`/p/${slug}`, '_blank')}
                      title="Preview public profile"
                      className="px-3"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link2 className="w-4 h-4" />
                  {slug ? (
                    <span>
                      Public URL: <code className="px-1 py-0.5 bg-muted rounded">/p/{slug}</code>
                    </span>
                  ) : (
                    <span>Enter a slug to create your public profile URL</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
                <div className="flex justify-between text-sm">
                  <p className="text-muted-foreground">
                    This will be displayed on your public profile
                  </p>
                  <p className={`${about.length >= 200 && about.length <= 400 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {about.length} chars {about.length >= 200 && about.length <= 400 ? '✓' : '(200–400 recommended)'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties & Services</Label>
                <div className="flex gap-2">
                  <Input
                    id="specialties"
                    placeholder="Enter a specialty (e.g., Wedding cakes)"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyDown={handleSpecialtyKeyDown}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSpecialty}
                    disabled={!newSpecialty.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add specialties one at a time. They'll appear as chips on your profile.
                </p>
                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {specialties.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {item}
                        <button
                          onClick={() => removeSpecialty(idx)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    type="url"
                    placeholder="https://facebook.com/yourpage"
                    value={social.facebook}
                    onChange={(e) => setSocial({...social, facebook: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    type="url"
                    placeholder="https://instagram.com/yourpage"
                    value={social.instagram}
                    onChange={(e) => setSocial({...social, instagram: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    type="url"
                    placeholder="https://tiktok.com/@yourpage"
                    value={social.tiktok}
                    onChange={(e) => setSocial({...social, tiktok: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    type="url"
                    placeholder="https://youtube.com/@yourpage"
                    value={social.youtube}
                    onChange={(e) => setSocial({...social, youtube: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinterest">Pinterest</Label>
                <Input
                  id="pinterest"
                  type="url"
                  placeholder="https://pinterest.com/yourpage"
                  value={social.pinterest}
                  onChange={(e) => setSocial({...social, pinterest: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Current logo" 
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-lg border flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/settings/media')}
                      className="w-full sm:w-auto"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload images in the Media Library and set as logo
                    </p>
                  </div>
                </div>
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
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Preview Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-background rounded-lg p-6 border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={displayName || 'Business logo'} 
                        className="w-20 h-20 object-cover rounded-lg border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {displayName || 'Your Business Name'}
                    </h3>
                    {about && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {about}
                      </p>
                    )}
                    
                    {specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {specialties.slice(0, 5).map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {specialties.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{specialties.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {profile?.social && (
                      <div className="flex gap-2">
                        {profile.social.facebook && (
                          <a 
                            href={profile.social.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Facebook className="w-4 h-4" />
                          </a>
                        )}
                        {profile.social.instagram && (
                          <a 
                            href={profile.social.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {profile.social.tiktok && (
                          <a 
                            href={profile.social.tiktok} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                            </svg>
                          </a>
                        )}
                        {profile.social.youtube && (
                          <a 
                            href={profile.social.youtube} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Youtube className="w-4 h-4" />
                          </a>
                        )}
                        {profile.social.pinterest && (
                          <a 
                            href={profile.social.pinterest} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                This is how your profile will appear to customers
              </p>
            </CardContent>
        </Card>
      </div>
  );

  if (embedded) {
    return (
      <>
        {content}
        <SaveBar onSave={handleSave} saving={saveMutation.isPending} disabled={!isDirty} />
      </>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <PageHeader
              title="Settings"
              subtitle="Manage your calculator and business profile settings"
            />
          </div>
          <PreviewButtons size="sm" />
        </div>

        <SettingsTabs />

        <div className="mt-6">
          {content}
        </div>
      </div>
      <SaveBar onSave={handleSave} saving={saveMutation.isPending} disabled={!isDirty} />
    </AppLayout>
  );
}
