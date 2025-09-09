'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

interface MenuCardProps {
  item: MenuItem;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export function MenuCard({ 
  item, 
  onEdit, 
  onDelete, 
  isAdmin = false,
  variant = 'default' 
}: MenuCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const price = typeof item.price === 'number' 
    ? `$${item.price.toFixed(2)}` 
    : item.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all",
        variant === 'featured' && "ring-2 ring-primary",
        !(item.available ?? item.isAvailable ?? true) && "opacity-75"
      )}
    >
      {/* Featured Badge */}
      {(item.featured || item.isFeatured) && (
        <div className="absolute top-2 left-2 z-10 bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">
          Featured
        </div>
      )}

      {/* Admin Controls */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={() => onEdit?.(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8 bg-red-500/90 hover:bg-red-500"
            onClick={() => onDelete?.(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Image Section */}
      {variant !== 'compact' && (
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
          {(item.image || item.imageUrl) && !imageError ? (
            <Image
              src={(item.image?.startsWith('/') 
                ? `http://72.167.227.205${item.image}` 
                : item.image) || (item.imageUrl?.startsWith('/') 
                ? `http://72.167.227.205${item.imageUrl}` 
                : item.imageUrl || '')}
              alt={item.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-20">🍽️</div>
            </div>
          )}
          
          {/* Overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.name}
              {!item.available && (
                <span className="ml-2 text-sm text-red-500">(Unavailable)</span>
              )}
            </h3>
            
            {/* Dietary Info */}
            {item.dietaryInfo && item.dietaryInfo.length > 0 && (
              <div className="flex gap-1 mt-1">
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
          </div>
          
          <span className="text-xl font-bold text-primary">
            {price}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Rating and Spicy Level */}
        <div className="flex items-center justify-between mt-3">
          {/* Spicy Level */}
          {item.spicyLevel && item.spicyLevel > 0 && (
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-sm",
                    i < item.spicyLevel! ? "text-red-500" : "text-gray-300 dark:text-gray-600"
                  )}
                >
                  🌶️
                </span>
              ))}
            </div>
          )}

          {/* Rating */}
          {item.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Menu Section Component
interface MenuSectionProps {
  title: string;
  description?: string;
  items: MenuItem[];
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  isAdmin?: boolean;
  variant?: 'grid' | 'list';
  columns?: 1 | 2 | 3 | 4;
}

export function MenuSection({
  title,
  description,
  items,
  onEdit,
  onDelete,
  onAdd,
  isAdmin = false,
  variant = 'grid',
  columns = 3,
}: MenuSectionProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        
        {isAdmin && (
          <Button onClick={onAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-500 dark:text-gray-400">
            No items in this section yet
          </p>
          {isAdmin && (
            <Button onClick={onAdd} className="mt-4">
              Add First Item
            </Button>
          )}
        </div>
      ) : variant === 'grid' ? (
        <div className={cn("grid gap-6", gridCols[columns])}>
          {items.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              isAdmin={isAdmin}
              variant="compact"
            />
          ))}
        </div>
      )}
    </section>
  );
}
