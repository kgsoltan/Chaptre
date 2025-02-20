const { generateUploadURL } = require('../s3');

exports.getS3Url = async (req, res) => {
  try {
    const url = await generateUploadURL();
    res.json({ url });
  } catch (error) {
    console.error('Error generating S3 URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
};
