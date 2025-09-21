import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function processAndSaveImage(buffer: Buffer, originalName: string): Promise<string> {
  try {
    const fileName = `${randomUUID()}-${Date.now()}${path.extname(originalName)}`;
    const filePath = path.join(uploadsDir, fileName);

    // Process image with sharp - resize and optimize
    await sharp(buffer)
      .resize(1200, 1200, { 
        fit: "inside", 
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toFile(filePath);

    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image");
  }
}
