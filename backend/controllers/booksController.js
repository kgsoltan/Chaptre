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
  const { book_title, author, author_id, cover_image_url, genre_tags } = req.body;
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
