import multer from 'multer';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const memoryStorage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowed = ['image/png'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only PNG images are allowed.'), false);
  }
  cb(null, true);
}

const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter,
});

export default upload;
