const cloudinary = require("cloudinary").v2;
require("../config/cloudinaryConfig");
const fs = require("fs");

const uploadToCloudinary = async (filePath, type = "image", folder = "uploads", optionsExtra = {}) => {
  try {
    const options = {
      folder,
      use_filename: true,
      unique_filename: false,
      ...optionsExtra
    };

    if (type === "image") {
      options.transformation = [
        { quality: "auto", fetch_format: "auto" },
        { width: 1200, crop: "limit" },
      ];
    }

    if (type === "video") {
      options.resource_type = "video";

      if (options.useUploadLarge) {
        delete options.useUploadLarge;
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_large(filePath, options, (err, result) => {
            if (err) return reject(err);
            fs.unlink(filePath, e => { if (e) console.error("Error deleting temp file:", e); });
            resolve(result.secure_url);
          });
        });
      } else {
        options.chunk_size = 6000000;
      }
    }

    const result = await cloudinary.uploader.upload(filePath, options);

    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => { if (err) console.error("Error deleting temp file:", err); });
    }

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

module.exports = uploadToCloudinary;
