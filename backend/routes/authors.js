const express = require('express');
const router = express.Router();
const authorsController = require('../controllers/authorsController');

// Authors endpoints
router.get('/', authorsController.getAuthors);
router.get('/:authorId', authorsController.getAuthorById);
router.post('/', authorsController.createAuthor);
router.patch('/:authorId', authorsController.updateAuthor);
router.delete('/:authorId', authorsController.deleteAuthor);
router.patch('/:authorId/profile_pic_url', authorsController.updateProfilePic);
router.get('/:authorId/following', authorsController.getFollowing);
router.get('/:authorId/books', authorsController.getAuthorBooks);

module.exports = router;

