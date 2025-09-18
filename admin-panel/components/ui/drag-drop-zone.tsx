'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragDropZoneProps {
  onFilesSelected: (files: FileList) => void;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  currentImage?: string | null;
  className?: string;
}

export function DragDropZone({
  onFilesSelected,
  accept = 'image/*',
  maxSize = 5,
  multiple = false,
  currentImage,
  className
}: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSelectFiles(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelectFiles(files);
    }
  };

  const validateAndSelectFiles = (files: FileList) => {
    setError(null);
    
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSizeBytes) {
        setError(`File "${files[i].name}" exceeds ${maxSize}MB limit`);
        return;
      }
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let isValid = false;
      
      for (const type of acceptedTypes) {
        if (type === 'image/*' && file.type.startsWith('image/')) {
          isValid = true;
          break;
        } else if (file.type === type || file.name.endsWith(type.replace('*', ''))) {
          isValid = true;
          break;
        }
      }
      
      if (!isValid) {
        setError(`File "${file.name}" is not an accepted format`);
        return;
      }
    }

    onFilesSelected(files);
  };

  const formatAcceptedTypes = () => {
    const types = accept.split(',').map(t => t.trim());
    if (types.includes('image/*')) {
      return 'JPG, PNG, GIF, WebP';
    }
    return types.join(', ').toUpperCase();
  };

  return (
    <div className={className}>
      <label
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-32 px-4 transition border-2 border-dashed rounded-lg cursor-pointer",
          isDragging 
            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" 
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
        />
        
        {currentImage ? (
          <div className="flex items-center gap-4">
            <img
              src={currentImage}
              alt="Current"
              className="h-20 w-20 object-cover rounded"
            />
            <div className="text-center">
              <FileImage className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click or drag to replace image
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-2 pb-2">
            <Upload className={cn(
              "w-10 h-10 mb-3 transition-colors",
              isDragging ? "text-orange-500" : "text-gray-400"
            )} />
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Drag & drop an image here, or click to browse files
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Accepted formats: {formatAcceptedTypes()} • Max size: {maxSize}MB
            </p>
          </div>
        )}
      </label>
      
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}




