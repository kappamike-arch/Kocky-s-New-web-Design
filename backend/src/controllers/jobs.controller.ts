import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { sendEmail } from '../utils/email';
import o365EmailService from '../services/o365EmailService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for resume file uploads
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = '/home/stagingkockys/public_html/uploads/jobs/resumes';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `resume-${uniqueSuffix}-${name}`);
  }
});

// Configure multer for hero image uploads
const heroStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = '/home/stagingkockys/public_html/uploads/jobs/hero';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `hero-${uniqueSuffix}-${name}`);
  }
});

// File filter for resume uploads (PDF, DOC, DOCX only)
const resumeFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
  }
};

// File filter for hero image uploads (Images only)
const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

export const upload = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export const uploadHeroImage = multer({
  storage: heroStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  }
});

// Submit job application
export const submitApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, phone, position, coverLetter } = req.body;
    const resumeFile = req.file;

    // Validate required fields
    if (!fullName || !email || !phone || !position) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fullName, email, phone, and position are required'
      });
    }

    // Validate position enum
    const validPositions = ['SERVER', 'BARTENDER', 'COOK', 'HOST', 'OTHER'];
    if (!validPositions.includes(position.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid position. Must be one of: Server, Bartender, Cook, Host, Other'
      });
    }

    // Create job application record
    const application = await prisma.jobApplication.create({
      data: {
        fullName,
        email,
        phone,
        position: position.toUpperCase(),
        resumeUrl: resumeFile ? `/uploads/jobs/resumes/${resumeFile.filename}` : null,
        coverLetter: coverLetter || null,
        status: 'PENDING'
      }
    });

    // Send emails using Office 365 service
    let emailStatus = { adminSent: false, customerSent: false };
    
    try {
      // Send internal admin notification
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🔔 New Job Application</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">A new job application has been submitted through the website:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <h3 style="margin-top: 0; color: #b22222;">Applicant Information</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>👤 Name:</strong> ${fullName}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📧 Email:</strong> ${email}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📞 Phone:</strong> ${phone}</li>
              </ul>
              <h3 style="color: #b22222; margin-top: 20px;">Application Details</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>💼 Position:</strong> ${position}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📄 Resume:</strong> ${resumeFile ? resumeFile.originalname : 'No resume attached'}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📝 Cover Letter:</strong> ${coverLetter || 'None provided'}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🆔 Application ID:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${application.id}</span></li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;"><strong>Action Required:</strong> Please review this application and contact the applicant if needed.</p>
          </div>
        </div>
      `;

      emailStatus.adminSent = await o365EmailService.sendEmail({
        to: 'info@kockys.com',
        subject: 'New Job Application - Kocky\'s Bar & Grill',
        html: adminEmailHtml,
      });

      // Send customer confirmation
      const customerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Application Received!</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${fullName},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your interest in joining the Kocky's Bar & Grill team! We have received your application for the ${position} position.</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>💼 Position:</strong> ${position}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🆔 Application ID:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">${application.id}</span></li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">We will review your application carefully and contact you within 1-2 weeks if your qualifications match our needs.</p>
            <p style="font-size: 16px; margin-bottom: 20px;">If you have any questions, please call us at <strong>(555) 123-4567</strong> or reply to this email.</p>
            <p style="font-size: 16px;">Best regards,<br><strong>The Kocky's Team</strong></p>
          </div>
        </div>
      `;

      emailStatus.customerSent = await o365EmailService.sendEmail({
        to: email,
        subject: 'Job Application Received - Kocky\'s Bar & Grill',
        html: customerEmailHtml,
      });

      if (emailStatus.adminSent) {
        console.log('✅ Internal job application notification sent to info@kockys.com');
      } else {
        console.log('⚠️ Internal job application notification not sent (email service not configured)');
      }

      if (emailStatus.customerSent) {
        console.log('✅ Job application confirmation sent to applicant:', email);
      } else {
        console.log('⚠️ Job application confirmation not sent (email service not configured)');
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      console.log('Email notification failed (non-critical):', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Job application submitted successfully',
      data: {
        id: application.id,
        fullName: application.fullName,
        position: application.position,
        submittedAt: application.createdAt
      },
      emailStatus,
    });

  } catch (error) {
    console.error('Error submitting job application:', error);
    next(error);
  }
};

// Get all job applications (admin only)
export const getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, position, page = 1, limit = 20 } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (position) where.position = position;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.jobApplication.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching job applications:', error);
    next(error);
  }
};

// Get single job application (admin only)
export const getApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const application = await prisma.jobApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Job application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error fetching job application:', error);
    next(error);
  }
};

// Update application status (admin only)
export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes, reviewedBy } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: {
        status,
        notes,
        reviewedBy,
        reviewedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    next(error);
  }
};

// Delete job application (admin only)
export const deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const application = await prisma.jobApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Job application not found'
      });
    }

    // Delete resume file if exists
    if (application.resumeUrl) {
      const filePath = path.join('/home/stagingkockys/public_html', application.resumeUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.jobApplication.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Job application deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting job application:', error);
    next(error);
  }
};

// Download resume file (admin only)
export const downloadResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const application = await prisma.jobApplication.findUnique({
      where: { id }
    });

    if (!application || !application.resumeUrl) {
      return res.status(404).json({
        success: false,
        error: 'Resume file not found'
      });
    }

    const filePath = path.join('/home/stagingkockys/public_html', application.resumeUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Resume file not found on server'
      });
    }

    // Set appropriate headers for file download
    const filename = path.basename(application.resumeUrl);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send file
    res.sendFile(filePath);

  } catch (error) {
    console.error('Error downloading resume:', error);
    next(error);
  }
};

// Get job page settings
export const getPageSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await prisma.jobPageSettings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.jobPageSettings.create({
        data: {
          heroTitle: 'Join Our Team',
          heroSubtitle: "Be part of the Kocky's family - where great food meets great people",
          introText: "We're always looking for passionate individuals to join our team",
          isActive: true
        }
      });
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error fetching job page settings:', error);
    next(error);
  }
};

// Update job page settings
export const updatePageSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { heroTitle, heroSubtitle, introText, isActive } = req.body;

    // Get existing settings or create new one
    let settings = await prisma.jobPageSettings.findFirst();
    
    if (settings) {
      settings = await prisma.jobPageSettings.update({
        where: { id: settings.id },
        data: {
          heroTitle: heroTitle || settings.heroTitle,
          heroSubtitle: heroSubtitle || settings.heroSubtitle,
          introText: introText || settings.introText,
          isActive: isActive !== undefined ? isActive : settings.isActive
        }
      });
    } else {
      settings = await prisma.jobPageSettings.create({
        data: {
          heroTitle: heroTitle || 'Join Our Team',
          heroSubtitle: heroSubtitle || "Be part of the Kocky's family - where great food meets great people",
          introText: introText || "We're always looking for passionate individuals to join our team",
          isActive: isActive !== undefined ? isActive : true
        }
      });
    }

    res.json({
      success: true,
      message: 'Page settings updated successfully',
      data: settings
    });

  } catch (error) {
    console.error('Error updating job page settings:', error);
    next(error);
  }
};

// Upload hero image
export const uploadHeroImageHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const heroImageUrl = `/uploads/jobs/hero/${req.file.filename}`;

    // Get existing settings or create new one
    let settings = await prisma.jobPageSettings.findFirst();
    
    if (settings) {
      // Delete old hero image if it exists
      if (settings.heroImage) {
        const oldImagePath = path.join('/home/stagingkockys/public_html', settings.heroImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      settings = await prisma.jobPageSettings.update({
        where: { id: settings.id },
        data: { heroImage: heroImageUrl }
      });
    } else {
      settings = await prisma.jobPageSettings.create({
        data: {
          heroImage: heroImageUrl,
          heroTitle: 'Join Our Team',
          heroSubtitle: "Be part of the Kocky's family - where great food meets great people",
          introText: "We're always looking for passionate individuals to join our team",
          isActive: true
        }
      });
    }

    res.json({
      success: true,
      message: 'Hero image uploaded successfully',
      data: {
        heroImageUrl,
        settings
      }
    });

  } catch (error) {
    console.error('Error uploading hero image:', error);
    next(error);
  }
};
