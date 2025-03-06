const { admin, db } = require('../config/firebase');

// Get all authors
exports.getAuthors = async (req, res) => {
  try {
    const snapshot = await db.collection('authors').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).send('Error fetching authors');
  }
};

// Get a specific author
exports.getAuthorById = async (req, res) => {
  const { authorId } = req.params;
  try {
    const doc = await db.collection('authors').doc(authorId).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Author not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error fetching author');
  }
};

// Create a new author
exports.createAuthor = async (req, res) => {
  const { first_name, last_name, email } = req.body;
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(400).send('Missing auth token');
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const newAuthor = {
      first_name,
      last_name,
      email,
      bio: '',
      profile_pic_url: '',
      favorited_books: [],
      following: [],
    };

    await db.collection('authors').doc(uid).set(newAuthor);
    res.status(201).json({ id: uid, ...newAuthor });
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).send('Error creating author');
  }
};

// Update an author
exports.updateAuthor = async (req, res) => {
  const { authorId } = req.params;
  const updatedData = { ...req.body };

  try {
    await db.collection('authors').doc(authorId).update(updatedData);
    res.status(200).json({ id: authorId, ...updatedData });
  } catch (error) {
    res.status(500).send('Error updating author');
  }
};

// Delete an author
exports.deleteAuthor = async (req, res) => {
  const { authorId } = req.params;
  try {
    await db.collection('authors').doc(authorId).delete();
    res.status(200).send(`Author '${authorId}' deleted`);
  } catch (error) {
    res.status(500).send(`Error deleting author '${authorId}'`);
  }
};

// Get all books for a specific author
exports.getAuthorBooks = async (req, res) => {
  const { authorId } = req.params;
  try {
    const snapshot = await db.collection('books').where('author_id', '==', authorId).get();
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(books);
  } catch (error) {
    res.status(500).send('Error fetching books');
  }
};

exports.updateProfilePic = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { profilePicUrl } = req.body;

    if (!authorId || !profilePicUrl) {
      console.error("Missing authorId or profilePicUrl");
      return res.status(400).send('Missing authorId or profilePicUrl');
    }

    const authorRef = db.collection('authors').doc(authorId);
    await authorRef.update({ profile_pic_url: profilePicUrl });

    console.log("Profile picture updated successfully");
    return res.status(200).send('Profile picture updated successfully');
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return res.status(500).send('Internal Server Error');
  }
};

// authorsController.js
exports.getFollowing = async (req, res) => {
  try {
    console.log("Requesting following for", req.params.authorId);  // Add this line for more insight
    const authorId = req.params.authorId;
    const followingList = await getFollowing(authorId);
    res.json({ following: followingList });
  } catch (error) {
    console.error('Error in getFollowing:', error);  // This will give more details about the error
    res.status(500).json({ error: 'Failed to fetch following list' });
  }
};

