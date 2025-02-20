const express = require('express');
const router = express.Router();
const s3Controller = require('../controllers/s3Controller');

router.get('/s3Url', s3Controller.getS3Url);

module.exports = router;
