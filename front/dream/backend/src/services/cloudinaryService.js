const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

const uploadToCloudinary = (buffer, folder = 'nannyconnect') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(new AppError('File upload failed.', 500));
        else resolve(result);
      }
    );
    stream.end(buffer);
  });

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
