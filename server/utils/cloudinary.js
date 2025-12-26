import { v2 as cloudinary } from 'cloudinary';
import ENV from '../config/env.js';
import fs from 'fs/promises';

/**
 * Uploads a file to Cloudinary and deletes the local file after upload
 * @param {string} filePath - The local file path to upload
 * @param {string} folder - The Cloudinary folder name to upload to
 * @returns {Promise<string>} The secure URL of the uploaded file
 * @throws {Error} If the upload fails or parameters are invalid
 */
export const uploadToCloudinary = async (filePath, folder) => {
    // Validate input parameters
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid file path provided');
    }

    if (!folder || typeof folder !== 'string') {
        throw new Error('Invalid folder name provided');
    }

    // Configure Cloudinary
    cloudinary.config({
        url: ENV.CLOUDINARY_URL
    });


    try {
        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto'
        });

        // Delete the local file after successful upload
        try {
            await fs.unlink(filePath);
        } catch (unlinkError) {
            console.error('Error deleting local file:', unlinkError);
            // Don't throw here as upload was successful
        }

        return result.secure_url;
    } catch (error) {
        // Delete local file even if upload fails
        try {
            await fs.unlink(filePath);
        } catch (unlinkError) {
            console.error('Error deleting local file after failed upload:', unlinkError);
        }

        console.error('Error uploading to Cloudinary:', error);
        throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
    }
};