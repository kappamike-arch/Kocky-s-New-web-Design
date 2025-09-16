'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Edit, Upload, Play, Pause, Volume2, VolumeX, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import themeConfig from '@/lib/theme-config';

// Helper function to get the correct logo URL
function getLogoUrl(logoUrl?: string): string {
  if (!logoUrl) return '/kockys-logo.png';
  
  // If it's already a full URL, return as is
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl;
  }
  
  // Get media base URL from environment
  const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || '/uploads';
  
  // If it starts with /uploads/, it's served by the backend
  if (logoUrl.startsWith('/uploads/')) {
    return `${MEDIA_BASE_URL.replace('/uploads', '')}${logoUrl}`;
  }
  
  // If it starts with /images/ or /videos/, it's a static file in public directory
  if (logoUrl.startsWith('/images/') || logoUrl.startsWith('/videos/')) {
    return logoUrl;
  }
  
  // Otherwise, it's a static file from the frontend
  return logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
}

function getFullMediaUrl(mediaUrl: string): string {
  if (!mediaUrl) return '';
  
  // If it's already a full URL, return as is
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    return mediaUrl;
  }
  
  // Get media base URL from environment
  const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || '/uploads';
  
  // If it starts with /uploads/, it's served by the backend
  if (mediaUrl.startsWith('/uploads/')) {
    return `${MEDIA_BASE_URL.replace('/uploads', '')}${mediaUrl}`;
  }
  
  // If it starts with /images/ or /videos/, it's a static file in public directory
  if (mediaUrl.startsWith('/images/') || mediaUrl.startsWith('/videos/')) {
    return mediaUrl;
  }
  
  // Otherwise, it's a static file from the frontend
  return mediaUrl.startsWith('/') ? mediaUrl : `/${mediaUrl}`;
}

interface HeroSectionProps {
  title?: string | null;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  mediaPreference?: string; // 'image', 'video', 'auto'
  overlayOpacity?: number;
  height?: 'small' | 'medium' | 'large' | 'full';
  showLogo?: boolean;
  logoUrl?: string;
  ctaButtons?: Array<{
    text: string;
    href: string;
    variant?: 'default' | 'outline';
  }>;
  isAdmin?: boolean;
  onEdit?: () => void;
  onUploadImage?: (file: File) => Promise<void>;
  onUploadVideo?: (file: File) => Promise<void>;
  onOpacityChange?: (opacity: number) => void;
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundVideo,
  mediaPreference = 'auto',
  overlayOpacity = 0.5,
  height = 'large',
  showLogo = false,
          logoUrl = '/kockys-logo.png?v=1756432883',
  ctaButtons = [],
  isAdmin = false,
  onEdit,
  onUploadImage,
  onUploadVideo,
  onOpacityChange,
  className,
}: HeroSectionProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);
  const [localOpacity, setLocalOpacity] = useState(overlayOpacity);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Debug log for logo rendering
  if (showLogo && logoUrl) {
    if (process.env.NODE_ENV === 'development') console.log('[DEBUG] HeroSection rendering logo with URL:', logoUrl);
    if (process.env.NODE_ENV === 'development') console.log('[DEBUG] showLogo:', showLogo);
    if (process.env.NODE_ENV === 'development') console.log('[DEBUG] logoUrl:', logoUrl);
  }

  useEffect(() => {
    setLocalOpacity(overlayOpacity);
  }, [overlayOpacity]);

  useEffect(() => {
    // Auto-play video when component mounts or video source changes
    if (videoRef.current && backgroundVideo && !videoError) {
      videoRef.current.play().catch(err => {
        console.error('Video autoplay failed:', err);
        setIsVideoPlaying(false);
      });
    }
  }, [backgroundVideo, videoError]);

  const heightClasses = {
    small: 'h-[40vh]',
    medium: 'h-[60vh]',
    large: 'h-[80vh]',
    full: 'h-screen',
  };

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Video play failed:', err);
        });
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(e.target.value);
    setLocalOpacity(newOpacity);
    if (onOpacityChange) {
      onOpacityChange(newOpacity);
    }
  };

  const handleVideoError = () => {
    console.error('Video failed to load');
    setVideoError(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const isVideo = file.type.startsWith('video/');
      if (isVideo && onUploadVideo) {
        await onUploadVideo(file);
        setVideoError(false); // Reset error state on new upload
      } else if (!isVideo && onUploadImage) {
        await onUploadImage(file);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden flex items-center justify-center",
        heightClasses[height],
        className
      )}
    >
      {/* Background Media Layer (z-0) */}
      <div className="absolute inset-0 z-0">
        {(() => {
          // Determine which media to use based on preference and availability
          let selectedMedia = null;
          let mediaType = 'none';
          
          console.log('[HERO] Media preference:', mediaPreference);
          console.log('[HERO] Background image available:', !!backgroundImage);
          console.log('[HERO] Background video available:', !!backgroundVideo);

          if (mediaPreference === 'image' && backgroundImage) {
            selectedMedia = backgroundImage;
            mediaType = 'image';
            console.log('[HERO] Using image (preference: image):', backgroundImage);
          } else if (mediaPreference === 'video' && backgroundVideo) {
            selectedMedia = backgroundVideo;
            mediaType = 'video';
            console.log('[HERO] Using video (preference: video):', backgroundVideo);
          } else if (mediaPreference === 'auto') {
            // Auto mode: prefer video if available, otherwise image
            if (backgroundVideo) {
              selectedMedia = backgroundVideo;
              mediaType = 'video';
              console.log('[HERO] Using video (preference: auto, video available):', backgroundVideo);
            } else if (backgroundImage) {
              selectedMedia = backgroundImage;
              mediaType = 'image';
              console.log('[HERO] Using image (preference: auto, no video):', backgroundImage);
            }
          } else {
            // Fallback: if preference doesn't match available media, use what's available
            if (backgroundImage) {
              selectedMedia = backgroundImage;
              mediaType = 'image';
              console.log('[HERO] Fallback to image (preference not available):', backgroundImage);
            } else if (backgroundVideo) {
              selectedMedia = backgroundVideo;
              mediaType = 'video';
              console.log('[HERO] Fallback to video (preference not available):', backgroundVideo);
            }
          }

          if (mediaType === 'image' && selectedMedia) {
            return (
              <Image
                src={getFullMediaUrl(selectedMedia)}
                alt="Hero background"
                fill
                className="object-cover"
                priority
                style={{ zIndex: 0 }}
              />
            );
          } else if (mediaType === 'video' && selectedMedia && !videoError) {
            return (
              <video
                ref={videoRef}
                key={selectedMedia} // Force re-render when source changes
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onError={handleVideoError}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 0 }}
              >
                <source src={getFullMediaUrl(selectedMedia)} type="video/mp4" />
                <source src={getFullMediaUrl(selectedMedia).replace('.mp4', '.webm')} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            );
          } else {
            console.log('[HERO] No background media - using gradient fallback');
            return (
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
            );
          }
        })()}
      </div>

      {/* Overlay Layer (z-1) */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ 
          opacity: localOpacity,
          zIndex: 1 
        }}
      />

      {/* Video Controls (z-20) */}
      {backgroundVideo && !videoError && (
        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={handleVideoToggle}
          >
            {isVideoPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={handleMuteToggle}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Opacity Slider - Only show in admin mode (z-20) */}
      {isAdmin && (
        <div className="absolute bottom-4 left-4 z-20">
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={() => setShowOpacitySlider(!showOpacitySlider)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          
          {showOpacitySlider && (
            <div className="absolute bottom-12 left-0 bg-black/80 backdrop-blur-sm rounded-lg p-4 min-w-[250px]">
              <label className="text-white text-sm mb-2 block">
                Overlay Opacity: {Math.round(localOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={localOpacity}
                onChange={handleOpacityChange}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Clear</span>
                <span>Dark</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Controls (z-30) */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-30 flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-black backdrop-blur-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </Button>
          {onEdit && (
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-black backdrop-blur-sm"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Content
            </Button>
          )}
        </div>
      )}

      {/* Content Layer - Higher z-index for better visibility (z-50) */}
      <div className="relative z-50 text-center text-white px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo or Title Container with enhanced visibility */}
          {showLogo ? (
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <img 
                  src={getLogoUrl(logoUrl)}
                  alt="Kocky's Logo" 
                  className="h-40 md:h-52 lg:h-64 w-auto relative z-20"
                  style={{ 
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))',
                    maxWidth: '90vw',
                    minHeight: '120px'
                  }}
                  onError={(e: any) => {
                    const target = e.target as HTMLImageElement;
                    console.warn('[DEBUG] Logo failed to load:', logoUrl);
                    // Fallback to default logo if not already using it
                    if (target.src !== '/kockys-logo.png' && !target.src.endsWith('/kockys-logo.png')) {
                      target.src = '/kockys-logo.png';
                    }
                  }}
                />
              </div>
            </div>
          ) : showLogo ? (
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <span className="text-6xl md:text-8xl font-bold relative z-20">
                  <span className="text-red-600 drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)]">Kocky's</span>
                  <span className="text-yellow-500 ml-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)]">Bar & Grill</span>
                </span>
              </div>
            </div>
          ) : title ? (
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] relative z-10">
              {title}
            </h1>
          ) : (
            // Fallback to default Kocky's if no logo or title
            <div className="mb-6 flex justify-center">
              <span className="text-5xl md:text-7xl font-bold relative z-10">
                <span className="text-red-600 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">Kocky's</span>
                <span className="text-yellow-500 ml-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">Bar & Grill</span>
              </span>
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <h2 className="text-xl md:text-3xl font-semibold mb-4 text-gray-100">
              {subtitle}
            </h2>
          )}

          {/* Description */}
          {description && (
            <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-3xl mx-auto">
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          {ctaButtons.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {ctaButtons.map((button, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant={button.variant || 'default'}
                  asChild
                  className={cn(
                    button.variant === 'outline' 
                      ? "border-white text-white hover:bg-white/20" 
                      : ""
                  )}
                >
                  <a href={button.href}>{button.text}</a>
                </Button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Scroll Indicator */}
        {height === 'full' && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2" />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// Editable Hero Section with inline editing and opacity control
interface EditableHeroProps extends HeroSectionProps {
  onSave?: (data: {
    title?: string | null;
    subtitle?: string;
    description?: string;
    overlayOpacity?: number;
  }) => Promise<void>;
}

export function EditableHeroSection({
  onSave,
  ...props
}: EditableHeroProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(props.title || '');
  const [editedSubtitle, setEditedSubtitle] = useState(props.subtitle || '');
  const [editedDescription, setEditedDescription] = useState(props.description || '');
  const [editedOpacity, setEditedOpacity] = useState(props.overlayOpacity || 0.5);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave({
        title: editedTitle || null,
        subtitle: editedSubtitle,
        description: editedDescription,
        overlayOpacity: editedOpacity,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(props.title || '');
    setEditedSubtitle(props.subtitle || '');
    setEditedDescription(props.description || '');
    setEditedOpacity(props.overlayOpacity || 0.5);
    setIsEditing(false);
  };

  if (isEditing && props.isAdmin) {
    return (
      <section className={cn("relative", props.className)}>
        <HeroSection {...props} overlayOpacity={editedOpacity} />
        
        {/* Editing Overlay */}
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Edit Hero Section</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title (leave empty to show logo)
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter title or leave empty for logo"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  type="text"
                  value={editedSubtitle}
                  onChange={(e) => setEditedSubtitle(e.target.value)}
                  placeholder="Enter subtitle"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Overlay Opacity: {Math.round(editedOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={editedOpacity}
                  onChange={(e) => setEditedOpacity(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <HeroSection
      {...props}
      title={editedTitle}
      subtitle={editedSubtitle}
      description={editedDescription}
      overlayOpacity={editedOpacity}
      onEdit={() => setIsEditing(true)}
      onOpacityChange={setEditedOpacity}
    />
  );
}