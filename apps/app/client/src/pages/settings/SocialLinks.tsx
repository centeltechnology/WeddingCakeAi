import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Save, Share2 } from 'lucide-react';
import { SettingsTabs } from '@/components/SettingsTabs';
import SaveBar from '@/components/SaveBar';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  pinterest?: string;
}

interface TenantProfile {
  id: string;
  tenantId: string;
  social: SocialLinks | null;
}

export default function SocialLinks({ embedded = false }: { embedded?: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [youtube, setYoutube] = useState('');
  const [pinterest, setPinterest] = useState('');

  const { data: profile, isLoading } = useQuery<TenantProfile | null>({
    queryKey: ['/api/me/profile'],
    queryFn: async () => {
      const data = await apiRequest('GET', '/api/me/profile', undefined);
      return data as TenantProfile | null;
    },
  });

  useEffect(() => {
    if (profile?.social) {
      setFacebook(profile.social.facebook || '');
      setInstagram(profile.social.instagram || '');
      setTiktok(profile.social.tiktok || '');
      setYoutube(profile.social.youtube || '');
      setPinterest(profile.social.pinterest || '');
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/me/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me/profile'] });
      toast({
        title: 'Social Links Saved',
        description: 'Your social media links have been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Unable to save social links',
        variant: 'destructive',
      });
    },
  });

  // Compute dirty state - treat missing profile as empty baseline
  const isDirty = useMemo(() => {
    // Allow saving when user enters data, even if no profile exists yet
    const hasData = !!(facebook || instagram || tiktok || youtube || pinterest);
    if (!profile?.social) return hasData;
    
    const social = profile.social;
    return (
      facebook !== (social.facebook || '') ||
      instagram !== (social.instagram || '') ||
      tiktok !== (social.tiktok || '') ||
      youtube !== (social.youtube || '') ||
      pinterest !== (social.pinterest || '')
    );
  }, [profile, facebook, instagram, tiktok, youtube, pinterest]);

  const handleSave = () => {
    saveMutation.mutate({
      social: {
        facebook,
        instagram,
        tiktok,
        youtube,
        pinterest,
      },
    });
  };

  if (isLoading) {
    const loadingContent = (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading social links...</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Add your social media profiles to help customers connect with you
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    type="url"
                    placeholder="https://facebook.com/yourbakery"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    type="url"
                    placeholder="https://instagram.com/yourbakery"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    type="url"
                    placeholder="https://tiktok.com/@yourbakery"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    type="url"
                    placeholder="https://youtube.com/@yourbakery"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinterest">Pinterest</Label>
                  <Input
                    id="pinterest"
                    type="url"
                    placeholder="https://pinterest.com/yourbakery"
                    value={pinterest}
                    onChange={(e) => setPinterest(e.target.value)}
                  />
                </div>
              </div>
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
        <PageHeader
          title="Settings"
          subtitle="Manage your calculator and business profile settings"
        />

        <SettingsTabs />

        <div className="mt-6">
          {content}
        </div>
      </div>
      <SaveBar onSave={handleSave} saving={saveMutation.isPending} disabled={!isDirty} />
    </AppLayout>
  );
}
