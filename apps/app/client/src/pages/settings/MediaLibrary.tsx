import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Upload, Image as ImageIcon, Trash2, Check } from 'lucide-react';
import { SettingsTabs } from '@/components/SettingsTabs';

interface MediaAsset {
  id: string;
  tenantId: string;
  url: string;
  mime: string | null;
  kind: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export default function MediaLibrary({ embedded = false }: { embedded?: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: assets = [], isLoading } = useQuery<MediaAsset[]>({
    queryKey: ['/api/media'],
    queryFn: async () => {
      const data = await apiRequest('GET', '/api/media', undefined);
      return data as MediaAsset[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploads/presign', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/me/profile'] });
      toast({
        title: 'Upload Successful',
        description: 'Your image has been uploaded.',
      });
      setUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Unable to upload image',
        variant: 'destructive',
      });
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/media/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({
        title: 'Image Deleted',
        description: 'The image has been removed from your library.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Unable to delete image',
        variant: 'destructive',
      });
    },
  });

  const setLogoMutation = useMutation({
    mutationFn: async (url: string) => {
      return await apiRequest('POST', '/api/media/logo', { url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/me/profile'] });
      toast({
        title: 'Logo Updated',
        description: 'Your logo has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Unable to set logo',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    uploadMutation.mutate(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    const loadingContent = (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading media library...</p>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Media Library
        </CardTitle>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Upload and manage your images. Click any image to set it as your logo.
        </p>

        {assets.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No images uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click "Upload Image" to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="relative group rounded-lg overflow-hidden border hover:border-primary transition-colors"
              >
                <img
                  src={asset.url}
                  alt="Media asset"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setLogoMutation.mutate(asset.url)}
                    disabled={setLogoMutation.isPending || asset.kind === 'logo'}
                  >
                    {asset.kind === 'logo' ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Current Logo
                      </>
                    ) : (
                      'Set as Logo'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(asset.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (embedded) {
    return content;
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <PageHeader
          title="Settings"
          subtitle="Manage your calculator and business profile settings"
        />

        <SettingsTabs />

        <div className="mt-6">
          {content}
        </div>
      </div>
    </AppLayout>
  );
}
