const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

// Book endpoints
router.get('/', booksController.getBooks);
router.get('/chunk', booksController.getChunk)
router.get('/toprated', booksController.getTopRatedBooks)
router.get('/search', booksController.search);
router.get('/:bookId', booksController.getBookById);
router.post('/', booksController.createBook);
router.patch('/:bookId', booksController.updateBook);
router.delete('/:bookId', booksController.deleteBook);
router.patch('/:bookId/cover_image_url', booksController.updateBookCover);


// Chapter endpoints under /books/:bookId
router.get('/:bookId/chapters', booksController.getChapters);
router.get('/:bookId/chapters/:chapterId', booksController.getChapterById);
router.post('/:bookId/chapters', booksController.createChapter);
router.patch('/:bookId/chapters/:chapterId', booksController.updateChapter);
router.delete('/:bookId/chapters/:chapterId', booksController.deleteChapter);

// Comment endpoints under /books/:bookId/chapters/:chapterId
router.get('/:bookId/chapters/:chapterId/comments', booksController.getComments);
router.post('/:bookId/chapters/:chapterId/comments', booksController.createComment);
router.patch('/:bookId/chapters/:chapterId/comments/:commentId', booksController.updateComment);
router.delete('/:bookId/chapters/:chapterId/comments/:commentId', booksController.deleteComment);

module.exports = router;