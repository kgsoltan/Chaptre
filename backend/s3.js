const dotenv = require('dotenv');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const { promisify } = require('util');

dotenv.config();

const randomBytes = promisify(crypto.randomBytes);

const region = 'us-east-2';
const bucketName = "chaptre-app";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Initialize the S3 Client
const s3 = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
  signatureVersion: 'v4', // Optional in v3 but added here for clarity
});

// Randomly generate unique ID for image and generate signed URL
async function generateUploadURL() {
  try {
    const rawBytes = await randomBytes(16);
    const imageName = rawBytes.toString('hex');

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: imageName,
    });

    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 });
    console.log('S3 params:', { Bucket: bucketName, Key: imageName });

    return { uploadURL, imageName };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error('Failed to generate signed URL');
  }
}

module.exports = { generateUploadURL };
