const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Vercel serverless has a read-only filesystem except for /tmp
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const uploadDir = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, '../../public/uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Upload directory creation warning:', e.message);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanName = (file.originalname || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${file.fieldname}-${uniqueSuffix}-${cleanName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30 MB
  }
});

// Safe middleware wrapper to catch multer limits and errors gracefully
upload.singleSafe = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'The attached file exceeds the 30 MB size limit. Please upload a compressed document or smaller file.'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file'
      });
    }
    next();
  });
};

module.exports = upload;
