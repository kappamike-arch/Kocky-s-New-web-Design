import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

export class MediaController {
  // Get all media files organized by category
  async getAllMedia(req: Request, res: Response) {
    try {
      const uploadsPath = path.join(__dirname, '../../uploads');
      
      // Check if uploads directory exists
      try {
        await fs.access(uploadsPath);
      } catch (error) {
        logger.error('Uploads directory not found:', error);
        return res.status(500).json({ 
          error: 'Uploads directory not accessible',
          message: 'Media storage is not properly configured'
        });
      }

      // Read all subdirectories in uploads
      const categories = await fs.readdir(uploadsPath, { withFileTypes: true });
      const mediaData: any = {};

      for (const category of categories) {
        if (category.isDirectory()) {
          const categoryPath = path.join(uploadsPath, category.name);
          try {
            const files = await fs.readdir(categoryPath);
            mediaData[category.name] = [];

            for (const file of files) {
              const filePath = path.join(categoryPath, file);
              const stats = await fs.stat(filePath);
              const fileExt = path.extname(file).toLowerCase();
              
              // Determine file type
              let fileType = 'other';
              if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
                fileType = 'image';
              } else if (['.mp4', '.webm', '.avi', '.mov'].includes(fileExt)) {
                fileType = 'video';
              }

              mediaData[category.name].push({
                name: file,
                type: fileType,
                size: stats.size,
                url: `/uploads/${category.name}/${file}`,
                fullUrl: `https://staging.kockys.com/uploads/${category.name}/${file}`,
                lastModified: stats.mtime,
                extension: fileExt
              });
            }
          } catch (error) {
            logger.warn(`Could not read category ${category.name}:`, error);
            mediaData[category.name] = [];
          }
        }
      }

      res.json({
        success: true,
        data: mediaData,
        categories: Object.keys(mediaData),
        totalFiles: Object.values(mediaData).reduce((sum: number, files: any) => sum + files.length, 0)
      });

    } catch (error) {
      logger.error('Error getting media files:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve media files',
        message: 'An error occurred while accessing the media library'
      });
    }
  }

  // Get media files from a specific category
  async getMediaByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const uploadsPath = path.join(__dirname, '../../uploads', category);
      
      // Check if category directory exists
      try {
        await fs.access(uploadsPath);
      } catch (error) {
        return res.status(404).json({ 
          error: 'Category not found',
          message: `Media category '${category}' does not exist`
        });
      }

      const files = await fs.readdir(uploadsPath);
      const mediaFiles = [];

      for (const file of files) {
        const filePath = path.join(uploadsPath, file);
        const stats = await fs.stat(filePath);
        const fileExt = path.extname(file).toLowerCase();
        
        // Determine file type
        let fileType = 'other';
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
          fileType = 'image';
        } else if (['.mp4', '.webm', '.avi', '.mov'].includes(fileExt)) {
          fileType = 'video';
        }

        mediaFiles.push({
          name: file,
          type: fileType,
          size: stats.size,
          url: `/uploads/${category}/${file}`,
          fullUrl: `https://staging.kockys.com/uploads/${category}/${file}`,
          lastModified: stats.mtime,
          extension: fileExt
        });
      }

      res.json({
        success: true,
        category,
        data: mediaFiles,
        totalFiles: mediaFiles.length
      });

    } catch (error) {
      logger.error(`Error getting media files for category ${req.params.category}:`, error);
      res.status(500).json({ 
        error: 'Failed to retrieve category media',
        message: 'An error occurred while accessing the media category'
      });
    }
  }

  // Delete a media file
  async deleteMedia(req: Request, res: Response) {
    try {
      const { category, filename } = req.params;
      const filePath = path.join(__dirname, '../../uploads', category, filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({ 
          error: 'File not found',
          message: `Media file '${filename}' not found in category '${category}'`
        });
      }

      // Delete the file
      await fs.unlink(filePath);
      logger.info(`Deleted media file: ${category}/${filename}`);

      res.json({
        success: true,
        message: `File '${filename}' deleted successfully`,
        deletedFile: {
          category,
          filename,
          path: `/uploads/${category}/${filename}`
        }
      });

    } catch (error) {
      logger.error(`Error deleting media file ${req.params.category}/${req.params.filename}:`, error);
      res.status(500).json({ 
        error: 'Failed to delete media file',
        message: 'An error occurred while deleting the media file'
      });
    }
  }

  // Get media library statistics
  async getMediaStats(req: Request, res: Response) {
    try {
      const uploadsPath = path.join(__dirname, '../../uploads');
      
      // Check if uploads directory exists
      try {
        await fs.access(uploadsPath);
      } catch (error) {
        return res.status(500).json({ 
          error: 'Uploads directory not accessible',
          message: 'Media storage is not properly configured'
        });
      }

      const categories = await fs.readdir(uploadsPath, { withFileTypes: true });
      const stats: any = {
        totalCategories: 0,
        totalFiles: 0,
        totalSize: 0,
        categories: {},
        fileTypes: {
          images: 0,
          videos: 0,
          other: 0
        }
      };

      for (const category of categories) {
        if (category.isDirectory()) {
          const categoryPath = path.join(uploadsPath, category.name);
          try {
            const files = await fs.readdir(categoryPath);
            stats.totalCategories++;
            stats.categories[category.name] = {
              fileCount: files.length,
              size: 0,
              types: { images: 0, videos: 0, other: 0 }
            };

            for (const file of files) {
              const filePath = path.join(categoryPath, file);
              const fileStats = await fs.stat(filePath);
              const fileExt = path.extname(file).toLowerCase();
              
              stats.totalFiles++;
              stats.totalSize += fileStats.size;
              stats.categories[category.name].size += fileStats.size;

              // Count file types
              if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
                stats.fileTypes.images++;
                stats.categories[category.name].types.images++;
              } else if (['.mp4', '.webm', '.avi', '.mov'].includes(fileExt)) {
                stats.fileTypes.videos++;
                stats.categories[category.name].types.videos++;
              } else {
                stats.fileTypes.other++;
                stats.categories[category.name].types.other++;
              }
            }
          } catch (error) {
            logger.warn(`Could not read category ${category.name} for stats:`, error);
          }
        }
      }

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Error getting media statistics:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve media statistics',
        message: 'An error occurred while calculating media statistics'
      });
    }
  }
}

export const mediaController = new MediaController();
