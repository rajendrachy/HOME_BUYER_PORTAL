const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'home-buyer-portal/documents',
    allowed_formats: ['jpg', 'png', 'pdf', 'jpeg', 'webp'],
    resource_type: 'auto',
    access_mode: 'public', // Ensure documents are publicly accessible
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const parts = file.originalname.split('.');
      const filename = parts[0];
      const ext = parts.length > 1 ? '.' + parts[parts.length - 1] : '';
      // Keep file extension in public_id so the URL ends with .pdf
      return `${filename}-${uniqueSuffix}${ext}`;
    }
  }
});

// Configure upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ✅ Fields matching frontend application form
const uploadDocuments = upload.fields([
  { name: 'citizenshipDocument', maxCount: 1 },
  { name: 'incomeProofDocument', maxCount: 1 },
  { name: 'propertyDocument', maxCount: 1 }
]);

module.exports = { upload, uploadDocuments };
