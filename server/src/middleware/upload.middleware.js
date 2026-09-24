const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Vercel serverless has a read-only filesystem except for /tmp
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const uploadDir = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
