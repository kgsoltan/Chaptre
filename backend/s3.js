const dotenv = require('dotenv');
const aws = require('aws-sdk');
const crypto = require('crypto');
const { promisify } = require('util');

dotenv.config();

const randomBytes = promisify(crypto.randomBytes);

const region = 'us-east-2';
const bucketName = "chaptre-app";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4'
});

//Randomly generate unique ID for image
async function generateUploadURL() {
    const rawBytes = await randomBytes(16);
    const imageName = rawBytes.toString('hex');
    
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Expires: 60  
    };
  
    console.log('S3 params:', params);
  
    try {
      const uploadURL = await s3.getSignedUrlPromise('putObject', params);
      return { uploadURL, imageName };
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw new Error('Failed to generate signed URL');
    }
  }
  


module.exports = { generateUploadURL };
