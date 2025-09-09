import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { successful: Array<{ uploadURL: string }> }) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file count
    if (files.length > maxNumberOfFiles) {
      setErrorMessage(`Maximum ${maxNumberOfFiles} file${maxNumberOfFiles > 1 ? 's' : ''} allowed`);
      return;
    }

    // Validate file size
    for (const file of files) {
      if (file.size > maxFileSize) {
        setErrorMessage(`File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`);
        return;
      }
      
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Only image files are allowed');
        return;
      }
    }

    setSelectedFiles(files);
    setErrorMessage('');
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');

    try {
      const uploadResults = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Get upload parameters
        const { method, url } = await onGetUploadParameters();
        
        // Upload file
        const uploadResponse = await fetch(url, {
          method,
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        // Convert the upload URL to the accessible URL
        // The upload URL is for a path like: /bucket/.../.private/uploads/{uuid}
        // We need to extract the uploads/{uuid} part for the /objects/ endpoint
        const urlParts = url.split('?')[0]; // Remove query parameters
        const pathPart = urlParts.split('/').slice(-2).join('/'); // Get "uploads/{uuid}"
        const accessURL = `/objects/${pathPart}`;
        
        console.log('Original upload URL:', url);
        console.log('Extracted access URL:', accessURL);
        
        uploadResults.push({ uploadURL: accessURL });
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setUploadStatus('success');
      setUploading(false);
      
      // Notify completion
      if (onComplete) {
        onComplete({ successful: uploadResults });
      }

      // Close modal after short delay
      setTimeout(() => {
        setShowModal(false);
        setSelectedFiles([]);
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedFiles([]);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    setUploading(false);
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)} className={buttonClassName} disabled={uploading}>
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                multiple={maxNumberOfFiles > 1}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              
              {selectedFiles.length === 0 ? (
                <div>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold border-0"
                  >
                    📁 Choose Images
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Max {maxNumberOfFiles} file{maxNumberOfFiles > 1 ? 's' : ''}, {Math.round(maxFileSize / 1024 / 1024)}MB each
                  </p>
                </div>
              ) : (
                <div>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">{Math.round(file.size / 1024)}KB</span>
                      </div>
                    ))}
                  </div>
                  
                  {!uploading && (
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        onClick={handleUpload} 
                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold border-0"
                      >
                        📸 Upload
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedFiles([])}>
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Progress value={uploadProgress} className="flex-1" />
                  <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                </div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            )}

            {/* Upload Status */}
            {uploadStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Upload successful!</span>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            {errorMessage && uploadStatus === 'idle' && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Cancel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}