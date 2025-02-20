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

