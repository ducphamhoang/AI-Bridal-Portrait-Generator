
import React, { useState, useRef, useCallback } from 'react';
import { PhotoIcon } from './Icons';
import { Spinner } from './Spinner';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageSelect: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isReading, setIsReading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      setIsReading(true);
      onImageSelect(file);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsReading(false);
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('There was an error processing your image. Please try another one.');
        setIsReading(false);
      }
      reader.readAsDataURL(file);
    }
  };

  const handleAreaClick = useCallback(() => {
    // Don't open file dialog if we're already processing an image
    if (isReading) return;
    fileInputRef.current?.click();
  }, [isReading]);

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-lg font-semibold text-gray-700 mb-2 text-center">{label}</label>
      <div
        onClick={handleAreaClick}
        className={`relative group w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-4 transition-all duration-300 bg-white ${isReading ? 'cursor-default' : 'cursor-pointer hover:border-pink-400 hover:bg-pink-50'}`}
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          disabled={isReading}
        />
        {isReading ? (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Spinner />
            <p className="mt-2 text-sm">Processing image...</p>
          </div>
        ) : preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-md" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300 rounded-md">
                <p className="text-white opacity-0 group-hover:opacity-100 font-semibold">Change Photo</p>
            </div>
          </>
        ) : (
          <div className="text-gray-500">
            <PhotoIcon className="w-16 h-16 mx-auto mb-2 text-gray-400" />
            <p className="font-semibold">Click to upload photo</p>
            <p className="text-sm">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
      {fileName && (
          <div className="text-center text-sm text-gray-500 mt-2 truncate" title={fileName}>
              {fileName}
          </div>
      )}
    </div>
  );
};
