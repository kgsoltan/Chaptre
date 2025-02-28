const { admin, db } = require('../config/firebase');

// Get published books
exports.getBooks = async (req, res) => {
  const count = parseInt(req.query.count);
  try {
    let query = db.collection('books').where('is_published', '==', true);
    if (!isNaN(count) && count > 0) {
      query = query.limit(count);
    }
    const snapshot = await query.get();
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(books);
  } catch (error) {
    res.status(500).send('Error fetching books');
  }
};

// Get a specific book
exports.getBookById = async (req, res) => {
  const { bookId } = req.params;
  try {
    const doc = await db.collection('books').doc(bookId).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error fetching book');
  }
};

// Create a new book
exports.createBook = async (req, res) => {
  const { book_title, author, author_id, book_synopsis, cover_image_url, genre_tags } = req.body;
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(400).send('Missing auth token');
  }
  try {
    await admin.auth().verifyIdToken(token);
    const newBook = {
      book_title,
      is_published: false,
      author,
      author_id,
      book_synopsis,
      cover_image_url, 
      genre_tags,
      num_chapters: 0,
      num_drafts: 0,
      date: 'TODO',
      chapters: [],
    };
    const docRef = await db.collection('books').add(newBook);
    res.status(201).json({ id: docRef.id, book_title });
  } catch (error) {
    res.status(500).send('Error creating book');
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  const { bookId } = req.params;
  const updatedData = { ...req.body };
  try {
    await db.collection('books').doc(bookId).update(updatedData);
    res.status(200).json({ id: bookId, ...updatedData });
  } catch (error) {
    res.status(500).send('Error updating book');
  }
};

// Delete a book (and all its chapters)
exports.deleteBook = async (req, res) => {
  const { bookId } = req.params;
  try {
    const bookRef = db.collection('books').doc(bookId);
    const chaptersRef = bookRef.collection('chapters');
    const batch = db.batch();

    const chaptersSnapshot = await chaptersRef.get();
    chaptersSnapshot.forEach(doc => batch.delete(doc.ref));
    batch.delete(bookRef);

    await batch.commit();
    res.status(200).send(`Book '${bookId}' deleted`);
  } catch (error) {
    res.status(500).send(`Error deleting book '${bookId}'`);
  }
};

// ------- CHAPTERS LOGIC -------

// Get all chapters for a book
exports.getChapters = async (req, res) => {
  const { bookId } = req.params;
  try {
    const snapshot = await db
      .collection('books')
      .doc(bookId)
      .collection('chapters')
      .orderBy('chapter_num')
      .get();
    const chapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(chapters);
  } catch (error) {
    res.status(500).send('Error fetching chapters');
  }
};

// Get a specific chapter
exports.getChapterById = async (req, res) => {
  const { bookId, chapterId } = req.params;
  try {
    const doc = await db
      .collection('books')
      .doc(bookId)
      .collection('chapters')
      .doc(chapterId)
      .get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error fetching chapter');
  }
};

// Create a new chapter
exports.createChapter = async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(400).send('Missing auth token');

  const { bookId } = req.params;
  const { title, chapter_num, text } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userID = decodedToken.uid;

    const bookDoc = await db.collection('books').doc(bookId).get();
    const ownerAuthorId = bookDoc.data().author_id;
    if (ownerAuthorId !== userID) {
      return res.status(401).send('Not allowed');
    }

    const docRef = await db
      .collection('books')
      .doc(bookId)
      .collection('chapters')
      .add({ title, chapter_num, text });

    res.status(201).json({ id: docRef.id, title, chapter_num, text });
  } catch (error) {
    res.status(500).send('Error creating chapter');
  }
};

// Update a chapter
exports.updateChapter = async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(400).send('Missing auth token');

  const { bookId, chapterId } = req.params;
  const updatedData = { ...req.body };

  try {
    await db
      .collection('books')
      .doc(bookId)
      .collection('chapters')
      .doc(chapterId)
      .update(updatedData);
    res.status(200).json({ id: chapterId, ...updatedData });
  } catch (error) {
    res.status(500).send('Error updating chapter');
  }
};

// Delete a chapter
exports.deleteChapter = async (req, res) => {
  const { bookId, chapterId } = req.params;
  try {
    await db
      .collection('books')
      .doc(bookId)
      .collection('chapters')
      .doc(chapterId)
      .delete();
    res.status(200).send(`Chapter '${chapterId}' deleted`);
  } catch (error) {
    res.status(500).send(`Error deleting chapter '${chapterId}'`);
  }
};

// ------- COMMENTS LOGIC -------

// Get all comments for a book
exports.getComments = async (req, res) => {
  const { bookId } = req.params;
  try {
    const snapshot = await db
      .collection('books')
      .doc(bookId)
      .collection('comments')
      .get();
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(comments);
  } catch (error) {
    res.status(500).send('Error fetching comments');
  }
};

// Get a specific comment
exports.getCommentById = async (req, res) => {
  const { bookId, commentId } = req.params;
  try {
    const doc = await db
      .collection('books')
      .doc(bookId)
      .collection('comments')
      .doc(commentId)
      .get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error fetching comment');
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(400).send('Missing auth token');

  const { bookId } = req.params;
  const { good_rating, text } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const commentor_id = decodedToken.uid;

    const commenterDoc = await db.collection('authors').doc(commentor_id).get();
    if (!commenterDoc.exists) {
      return res.status(404).json({ error: 'Author not found' });
    }

    const { first_name, last_name } = commenterDoc.data();
    const commentor_name = `${first_name} ${last_name}`;

    const docRef = await db
      .collection('books')
      .doc(bookId)
      .collection('comments')
      .add({ commentor_id, commentor_name, good_rating, text });

    res.status(201).json({ id: docRef.id, commentor_id, commentor_name, good_rating, text });
  } catch (error) {
    res.status(500).send('Error creating comment');
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(400).send('Missing auth token');

  const { bookId, commentId } = req.params;
  const updatedData = { ...req.body };

  try {
    await db
      .collection('books')
      .doc(bookId)
      .collection('comments')
      .doc(commentId)
      .update(updatedData);
    res.status(200).json({ id: commentId, ...updatedData });
  } catch (error) {
    res.status(500).send('Error updating comment');
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  const { bookId, commentId } = req.params;
  try {
    await db
      .collection('books')
      .doc(bookId)
      .collection('comments')
      .doc(commentId)
      .delete();
    res.status(200).send(`Chapter '${commentId}' deleted`);
  } catch (error) {
    res.status(500).send(`Error deleting chapter '${commentId}'`);
  }
};

// Update cover image URL for a specific book
exports.updateBookCover = async (req, res) => {
  try {
      const { bookId } = req.params;
      const { coverImageUrl } = req.body;
      if (!bookId || !coverImageUrl) {
          console.error("Missing bookId, or coverImageUrl");
          return res.status(400).send('Missing authorId, bookId, or coverImageUrl');
      }

      // Firestore update
      const bookRef = db.collection('books').doc(bookId);
      await bookRef.update({ cover_image_url: coverImageUrl });

      console.log("Cover image updated successfully");
      return res.status(200).send('Cover image updated successfully');
  } catch (error) {
      console.error('Error updating cover image:', error);
      return res.status(500).send('Internal Server Error');
  }
};

//search book route
exports.search = async (req, res) => {
  let { q, genre } = req.query;  // Get search term and genre
  q = q?.toLowerCase();

  try {
      const booksRef = db.collection('books').where('is_published', '==', true);

      // Handle multiple genres and ensure array
      let genresArray = [];
      if (genre) {
          genresArray = Array.isArray(genre) ? genre : [genre];
      }

      let books = [];

      //query for authors and titles
      const allBooksSnapshot = await booksRef.get();
      books = allBooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      //filter for author and title
      if (q) {
          books = books.filter(book => book.book_title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q));
      }

      //filter selected books with genres
      if (genresArray.length > 0) {
          books = books.filter(book => book.genre_tags.some(tag => genresArray.includes(tag)));
      }

      res.json(books);
  } catch (error) {
      console.error("Error during search:", error);
      res.status(500).json({ error: 'Failed to fetch books' });
  }
};