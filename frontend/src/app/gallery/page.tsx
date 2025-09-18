'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Expand, Heart, Share2 } from 'lucide-react';
import { HeroSection } from '@/components/sections/HeroSection';

interface GalleryImage {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string; // Changed from url to imageUrl to match API
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'food' | 'drinks' | 'events'>('all');

  // Fetch images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('https://staging.kockys.com/api/gallery/items?isActive=true');
        const data = await response.json();
        
        if (data.success) {
          setImages(data.data);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Load liked images from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('likedGalleryImages');
    if (saved) {
      setLikedImages(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save liked images to localStorage
  const toggleLike = (imageId: string) => {
    const newLiked = new Set(likedImages);
    if (newLiked.has(imageId)) {
      newLiked.delete(imageId);
    } else {
      newLiked.add(imageId);
    }
    setLikedImages(newLiked);
    localStorage.setItem('likedGalleryImages', JSON.stringify(Array.from(newLiked)));
  };

  // Share image
  const shareImage = async (image: GalleryImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title || "Kocky's Gallery",
          text: image.caption || "Check out this photo from Kocky's Bar & Grill!",
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      if (e.key === 'Escape') {
        setSelectedImage(null);
        setSelectedIndex(-1);
      } else if (e.key === 'ArrowLeft' && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
        setSelectedImage(images[selectedIndex - 1]);
      } else if (e.key === 'ArrowRight' && selectedIndex < images.length - 1) {
        setSelectedIndex(selectedIndex + 1);
        setSelectedImage(images[selectedIndex + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, selectedIndex, images]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const lightboxVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <HeroSection
        page="gallery"
        title="Gallery"
        subtitle="Memories & Moments"
        description="Explore the vibrant atmosphere of Kocky's"
      />

      {/* Filter Tabs */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 py-4">
            {['all', 'food', 'drinks', 'events'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as any)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  filter === tab
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No images available at the moment.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {images.filter(image => image && image.id && image.imageUrl).map((image, index) => (
                <motion.div
                  key={image.id || `gallery-${index}`}
                  variants={itemVariants}
                  className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-900"
                  onClick={() => {
                    if (image && image.id) {
                      setSelectedImage(image);
                      setSelectedIndex(index);
                    }
                  }}
                >
                  {/* Image Container with Aspect Ratio */}
                  <div className="aspect-square relative">
                    <img
                      src={`https://staging.kockys.com${image.thumbnailUrl || image.imageUrl}`}
                      alt={image.title || 'Gallery image'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(image.id);
                          }}
                          className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                            likedImages.has(image.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${likedImages.has(image.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(image);
                            setSelectedIndex(index);
                          }}
                          className="p-3 bg-white/20 rounded-full backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                        >
                          <Expand className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            shareImage(image);
                          }}
                          className="p-3 bg-white/20 rounded-full backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Title Overlay */}
                    {image.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-medium text-sm truncate">{image.title}</h3>
                        {image.caption && (
                          <p className="text-xs text-gray-300 truncate mt-1">{image.caption}</p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            variants={lightboxVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={() => {
              setSelectedImage(null);
              setSelectedIndex(-1);
            }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
                setSelectedIndex(-1);
              }}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            {selectedIndex > 0 && (
              <button
                className="absolute left-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(selectedIndex - 1);
                  setSelectedImage(images[selectedIndex - 1]);
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            
            {selectedIndex < images.length - 1 && (
              <button
                className="absolute right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(selectedIndex + 1);
                  setSelectedImage(images[selectedIndex + 1]);
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Image Container */}
            <div
              className="relative max-w-7xl max-h-[90vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`https://staging.kockys.com${selectedImage.imageUrl}`}
                alt={selectedImage.title || 'Gallery image'}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              
              {/* Image Info */}
              {(selectedImage.title || selectedImage.caption) && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                  {selectedImage.title && (
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h2>
                  )}
                  {selectedImage.caption && (
                    <p className="text-gray-300">{selectedImage.caption}</p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(selectedImage.id);
                }}
                className={`px-6 py-3 rounded-full backdrop-blur-sm transition-all flex items-center gap-2 ${
                  likedImages.has(selectedImage.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart className={`h-5 w-5 ${likedImages.has(selectedImage.id) ? 'fill-current' : ''}`} />
                {likedImages.has(selectedImage.id) ? 'Liked' : 'Like'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareImage(selectedImage);
                }}
                className="px-6 py-3 bg-white/20 rounded-full backdrop-blur-sm text-white hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
