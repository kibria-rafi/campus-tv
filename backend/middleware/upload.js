const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campus-tv',
    allowed_formats: allowedFormats,
    resource_type: 'image',
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size
  },
  fileFilter: (_req, file, cb) => {
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    const mimeAllowed = allowedFormats.some((format) =>
      file.mimetype === `image/${format === 'jpg' ? 'jpeg' : format}`
    );

    if (allowedFormats.includes(extension) && mimeAllowed) {
      cb(null, true);
      return;
    }

    cb(new Error('Unsupported image format. Use JPG, JPEG, PNG, or WEBP.'));
  },
});

module.exports = upload;
