const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

// Pastikan folder uploads ada
const ensureUploadDir = (folder) => {
  const dir = path.join(__dirname, "..", "uploads", folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Storage engine
const createStorage = (folder) => {
  ensureUploadDir(folder);
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "..", "uploads", folder));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${folder}-${uuidv4()}${ext}`;
      cb(null, filename);
    },
  });
};

// Filter: hanya gambar
const imageFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung. Gunakan: JPG, PNG, WEBP, GIF"), false);
  }
};

// Upload instances
const uploadGallery = multer({
  storage: createStorage("gallery"),
  fileFilter: imageFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

const uploadProgram = multer({
  storage: createStorage("programs"),
  fileFilter: imageFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

const uploadArticle = multer({
  storage: createStorage("articles"),
  fileFilter: imageFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

const uploadAvatar = multer({
  storage: createStorage("avatars"),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Helper: build public URL untuk gambar
const buildImageUrl = (req, relativePath) => {
  if (!relativePath) return null;
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/${relativePath.replace(/\\/g, "/")}`;
};

// Helper: hapus file dari disk
const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, "..", filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = { uploadGallery, uploadProgram, uploadArticle, uploadAvatar, buildImageUrl, deleteFile };
