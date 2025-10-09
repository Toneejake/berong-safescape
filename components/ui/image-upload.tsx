'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Copy, Check, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  title?: string;
  description?: string;
}

export function ImageUpload({ onUploadComplete, title = "Image Upload", description = "Upload an image to generate a URL" }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clean up preview URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size too large. Maximum 5MB allowed.');
        return;
      }

      setFile(selectedFile);
      setError(null);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setUploadUrl('');
    }
  };

 const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadUrl(result.url);
      onUploadComplete(result.url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (uploadUrl) {
      navigator.clipboard.writeText(uploadUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
 };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

 const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith('image/')) {
        setError('Please drop an image file (JPEG, PNG, etc.)');
        return;
      }

      if (droppedFile.size > 5 * 1024 * 1024) {
        setError('File size too large. Maximum 5MB allowed.');
        return;
      }

      setFile(droppedFile);
      setError(null);

      // Create preview URL
      const url = URL.createObjectURL(droppedFile);
      setPreviewUrl(url);
      setUploadUrl('');
    }
 };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {file ? file.name : 'Click or drag an image to upload'}
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: 5MB
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}

        {previewUrl && !uploadUrl && (
          <div className="mt-4">
            <div className="flex justify-center">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-48 rounded-md object-contain"
              />
            </div>
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="w-full md:w-auto"
              >
                {isUploading ? (
                  <>
                    <span className="mr-2">Uploading...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {uploadUrl && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-center">
              <img 
                src={uploadUrl} 
                alt="Uploaded" 
                className="max-h-48 rounded-md object-contain"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Generated URL:</Label>
              <div className="flex">
                <Input 
                  value={uploadUrl} 
                  readOnly 
                  className="rounded-r-none"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="rounded-l-none border-l-0 px-3"
                  onClick={handleCopyUrl}
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Copy the URL above and paste it in the "Image URL" field
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
