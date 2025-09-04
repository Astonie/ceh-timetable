import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename to prevent overwrites
    const uniqueId = uuidv4();
    const filename = `${uniqueId}-${file.name.replace(/\s+/g, '_')}`;
    
    // Ensure the uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    
    // Write the file to the uploads directory
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL of the uploaded file
    const fileUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ 
      success: true,
      fileUrl,
      filename: file.name,
      size: file.size
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
