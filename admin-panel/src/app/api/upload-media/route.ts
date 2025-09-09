import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sectionId = formData.get('sectionId') as string;
    const type = formData.get('type') as string;

    if (!file || !sectionId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    
    if (type === 'image' && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Allowed: JPG, PNG, WebP' },
        { status: 400 }
      );
    }
    
    if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid video type. Allowed: MP4, WebM' },
        { status: 400 }
      );
    }

    // Get the appropriate file extension
    let extension = '';
    if (type === 'image') {
      extension = file.type === 'image/webp' ? '.webp' : 
                  file.type === 'image/png' ? '.png' : '.jpg';
    } else {
      extension = file.type === 'video/webm' ? '.webm' : '.mp4';
    }

    // Construct the filename based on section and type
    const filename = `${sectionId}-hero${extension}`;
    
    // Determine the upload directory
    const uploadDir = type === 'image' ? 'images' : 'videos';
    
    // Get the path to the frontend public directory (go up from admin-panel to root, then to frontend/public)
    const frontendPublicPath = path.join(process.cwd(), '..', 'frontend', 'public', uploadDir);
    
    // Create directory if it doesn't exist
    if (!existsSync(frontendPublicPath)) {
      await mkdir(frontendPublicPath, { recursive: true });
    }

    // Full path for the file
    const filePath = path.join(frontendPublicPath, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      filename: filename,
      path: `/${uploadDir}/${filename}`
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Also support GET to check if files exist
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get('sectionId');
  const type = searchParams.get('type');
  
  if (!sectionId || !type) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const uploadDir = type === 'image' ? 'images' : 'videos';
  const extensions = type === 'image' ? ['.jpg', '.png', '.webp'] : ['.mp4', '.webm'];
  
  const frontendPublicPath = path.join(process.cwd(), '..', 'frontend', 'public', uploadDir);
  
  // Check which file exists
  for (const ext of extensions) {
    const filename = `${sectionId}-hero${ext}`;
    const filePath = path.join(frontendPublicPath, filename);
    
    if (existsSync(filePath)) {
      return NextResponse.json({ 
        exists: true,
        path: `/${uploadDir}/${filename}`
      });
    }
  }
  
  return NextResponse.json({ exists: false });
}
