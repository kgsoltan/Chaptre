const { admin } = require('../config/firebase');

exports.verifyToken = async (req, res) => {
  const token = req.body.token;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.json({
      success: true,
      uid: decodedToken.uid
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid Token'
    });
  }
};
