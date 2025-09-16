'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/asset-config';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  category: string;
  image?: string;
  imageUrl?: string;
  featured?: boolean;
  isFeatured?: boolean;
  spicyLevel?: number;
  rating?: number;
  dietaryInfo?: string[];
  available?: boolean;
  isAvailable?: boolean;
}

interface SimpleMenuCardProps {
  item: MenuItem;
  variant?: 'default' | 'compact' | 'featured';
}

export function SimpleMenuCard({ 
  item, 
  variant = 'default' 
}: SimpleMenuCardProps) {
  const [imageError, setImageError] = useState(false);

  const price = typeof item.price === 'number' 
    ? `$${item.price.toFixed(2)}` 
    : item.price;

  return (
    <div
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all",
        variant === 'featured' && "ring-2 ring-primary",
        !(item.available ?? item.isAvailable ?? true) && "opacity-75"
      )}
    >
      {/* Featured Badge */}
      {(item.featured || item.isFeatured) && (
        <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          Featured
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
        {(item.image || item.imageUrl) && !imageError ? (
          <Image
            src={getAssetUrl(item.image || item.imageUrl || '')}
            alt={item.name}
            fill
            className="object-cover"
            onError={() => {
              console.log('Image failed to load:', item.image || item.imageUrl);
              setImageError(true);
            }}
            unoptimized={true}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm">No Image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {item.name}
          </h3>
          <span className="text-lg font-bold text-primary">
            {price}
          </span>
        </div>
        
        {/* Dietary Info */}
        {item.dietaryInfo && Array.isArray(item.dietaryInfo) && item.dietaryInfo.length > 0 && (
          <div className="flex gap-1 mb-2">
            {item.dietaryInfo.map((info) => (
              <span
                key={info}
                className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
              >
                {info}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Rating */}
        {item.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {item.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Spicy Level */}
        {item.spicyLevel && item.spicyLevel > 0 && (
          <div className="mt-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < item.spicyLevel! ? 'text-red-500' : 'text-gray-300'
                  }`}
                >
                  🌶️
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


