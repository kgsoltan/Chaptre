import { getS3UploadUrl } from './api';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

export const validateFile = (file) => {
  if (!file) return false;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    alert("File size is too large. Please upload a file smaller than 5MB.");
    return false;
  }

  return true;
};

export const uploadToS3 = async (file) => {
  const { uploadURL, imageName } = await getS3UploadUrl();

  if (!uploadURL || !imageName) {
    throw new Error("Missing upload URL or image name");
  }

  console.log("Uploading to S3:", uploadURL);

  const s3Response = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!s3Response.ok) {
    throw new Error("Failed to upload image");
  }

  console.log("Image successfully uploaded to S3");

  return `https://chaptre-app.s3.us-east-2.amazonaws.com/${imageName}`;
};
