const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const uploadImage = async (file) => {
  try {
    if (!file) return null;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'ewaste_uploads'
      });
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } else {
      return file.filename;
    }
  } catch (error) {
    console.error('Image Upload Error:', error.message);
    return file ? file.filename : null;
  }
};

module.exports = { uploadImage };
