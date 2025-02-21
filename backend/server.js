const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import route modules
const authorsRoutes = require('./routes/authors');
const booksRoutes = require('./routes/books');
const s3Routes = require('./routes/s3');
const authRoutes = require('./routes/auth');

// Mount the routes
app.use('/authors', authorsRoutes);
app.use('/books', booksRoutes);
app.use('/', s3Routes);
app.use('/verify-token', authRoutes);

// Update cover image URL for a specific book
app.patch("/books/:bookId/cover_image_url", async (req, res) => {
    try {
        const { bookId } = req.params;
        const { coverImageUrl } = req.body;
        console.log(bookId);
        console.log(coverImageUrl);
        if (!bookId || !coverImageUrl) {
            console.error("Missing bookId, or coverImageUrl");
            return res.status(400).send('Missing authorId, bookId, or coverImageUrl');
        }

        // Firestore update
        const bookRef = firestore.collection('books').doc(bookId);
        await bookRef.update({ cover_image_url: coverImageUrl });

        console.log("Cover image updated successfully");
        return res.status(200).send('Cover image updated successfully');
    } catch (error) {
        console.error('Error updating cover image:', error);
        return res.status(500).send('Internal Server Error');
    }
});


// Test route
app.get('/', (req, res) => {
  res.send('Hello! Backend is running!');
});

// Start server
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
module.exports = app;

