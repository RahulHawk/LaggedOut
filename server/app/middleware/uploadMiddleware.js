const multer = require("multer");
const path = require("path");
const fs = require("fs");


const tempDir = path.join(__dirname, "..", "uploads", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
// --- Storage ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.fieldname + ext);
  },
});

// --- File filter (type check) ---
const fileFilter = (req, file, cb) => {
  if (
    file.fieldname === "coverImage" ||
    file.fieldname === "screenshots" ||
    file.fieldname === "profilePic" ||
    file.fieldname === "image" ||
    file.fieldname === "avatar" // single avatar
  ) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for coverImage/screenshots/profilePic/avatar/image"), false);
    }
  } else if (file.fieldname === "trailer") {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed for trailer"), false);
    }
  } else {
    cb(new Error("Invalid field name"), false);
  }
};

// --- Multer config ---
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // default global max
  },
}).fields([
  { name: "coverImage", maxCount: 1 },
  { name: "screenshots", maxCount: 5 },
  { name: "trailer", maxCount: 2 },
  { name: "profilePic", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "avatar", maxCount: 1 } // single avatar per game/edition/DLC
]);

// --- Error handler middleware for friendly messages ---
const uploadWithErrorHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        if (err.field === "profilePic") {
          return res.status(400).json({ message: "Profile picture too large. Max 5MB allowed" });
        } else if (err.field === "coverImage" || err.field === "screenshots" || err.field === "avatar") {
          return res.status(400).json({ message: "Image too large. Max 10MB allowed" });
        } else if (err.field === "trailer") {
          return res.status(400).json({ message: "Trailer too large. Max 500MB allowed" });
        }
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

module.exports = uploadWithErrorHandler;
