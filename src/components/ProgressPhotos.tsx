'use client';

import { useState, useRef } from 'react';

interface ProgressPhotosProps {
  onPhotosAdded?: (photos: string[]) => void;
}

export default function ProgressPhotos({ onPhotosAdded }: ProgressPhotosProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotos: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Convert to base64 for localStorage (in production, upload to cloud storage)
      const reader = new FileReader();
      const promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
      });
      reader.readAsDataURL(file);
      
      const base64 = await promise;
      newPhotos.push(base64);
    }

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    onPhotosAdded?.(updatedPhotos);
    setUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    onPhotosAdded?.(updated);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="photo-upload"
      />
      
      <label
        htmlFor="photo-upload"
        className={`block w-full cursor-pointer bg-dark-700 hover:bg-dark-600 border-2 border-dashed border-dark-600 rounded-xl p-6 text-center transition-colors ${
          uploading ? 'opacity-50' : ''
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-white font-medium">
              {uploading ? 'Adding photos...' : 'Add Progress Photos'}
            </p>
            <p className="text-gray-500 text-sm mt-1">Tap to select photos from your device</p>
          </div>
        </div>
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={photo}
                alt={`Progress ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
