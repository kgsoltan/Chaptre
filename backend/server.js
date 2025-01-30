/*
NOTES:
-we should plan to compartmentalize our routes that are contained in this file. What ive
seen most commonly is a "routes" folder and a "controllers" folder which contain all our logic necessary
to do any of the request handling (any structure is fine with me this is just a suggestion). 
This file will get messy soon and its probably just better for
readability purposes. For now just dump code in here if you need the backend changed and
we will fix it later.
*/

// Impoorting required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Firebase Admin SDK setup
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chaptre-b7fcb-default-rtdb.firebaseio.com",
});

// Test route
app.get('/', (req, res) => {
    res.send('Hello! Backend is running!');
});

// Token verification route
app.post('/verify-token', async (req, res) => {
    const token = req.body.token;

    try{
        const decodedToken = await admin.auth().verifyIdToken(token);
        res.json({
            success: true,
            uid: decodedToken.uid});
    }catch(error){
        res.status(401).json({
            success: false,
            message: "Invalid Token"
        });
    }
});

//DATABASE STUFF ----------------------------
const db = admin.firestore();

//temp firestore test
//this is only in place to make sure that our firestore properly interacts with-
//the express server
app.get('/test-firestore', async (req, res) => {
    try {
        const snapshot = await db.collection('test').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(data);
    } catch (error) {
        console.error('Error connecting to Firestore:', error);
        res.status(500).send('Error connecting to Firestore');
    }
});

/*
Note to group members:
The following three get and post routes are the basis for
our frontend interacting with our backend and database. If you are coding any
frontend you should be able to retrieve or input basic database data with these routes.
Additionally we should try to get JEST or some other testing framework to
make sure that these work under all circumstances.
We can also modify these if we end up changing how data is structured in our database.
I sent one POST request manually through the authors route and it showed up on 
the firestore database.
*/

app.get('/authors', async(req, res) => {
    try{
        const snapshot = await db.collection('authors').get();
        const authors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(authors);
    }catch (error){
        res.status(500).send('Error with fetching authors');
    }
});

app.post('/authors', async (req, res) => {
    const { name } = req.body;
    try {
        const docRef = await db.collection('authors').add({ name });
        res.status(201).json({ id: docRef.id, name });
    } catch (error) {
        res.status(500).send('Error creating author');
    }
});


app.put('/authors/:authorId', async (req, res) => {
    const { authorId } = req.params;
    const { name, bio } = req.body;
  
    try {
      const authorRef = db.collection('authors').doc(authorId);
      await authorRef.update({ name, bio });
      
      const updatedAuthor = await authorRef.get();
      res.json({ id: updatedAuthor.id, ...updatedAuthor.data() });
    } catch (error) {
      console.error('Error updating author:', error);
      res.status(500).send('Error updating author');
    }
  });
  

//BOOKS POST AND GET -----------------------------
app.get('/books', async (req, res) => {
    try {
        const snapshot = await db.collection('books').get();
        const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(books);
    } catch (error) {
        res.status(500).send('Error fetching books');
    }
});

app.post('/books', async (req, res) => {
    const { title, author, userID, chapters, drafts, published, genre } = req.body;
    try {
        const docRef = await db.collection('books').add({ title, author, userID, chapters, drafts, published, genre });
        res.status(201).json({ id: docRef.id, title, author, userID, chapters, drafts, published, genre });
    } catch (error) {
        res.status(500).send('Error creating book');
    }
});

app.patch('/books/:bookId', async (req, res) => {
    const { bookId } = req.params; // Extract the book ID from the URL parameter
    const { title, author, userID, chapters, drafts, published, genre } = req.body; // Extract updated data from the request body

    // Prepare the data object to update
    const updatedData = {};

    if (title) updatedData.title = title;
    if (author) updatedData.author = author;
    if (userID) updatedData.userID = userID;
    if (chapters) updatedData.chapters = chapters;
    if (drafts) updatedData.drafts = drafts;
    if (published) updatedData.published = published;
    if (genre) updatedData.genre = genre;

    try {
        // Update the book document using the book ID
        const docRef = db.collection('books').doc(bookId);
        await docRef.update(updatedData);

        // Respond with the updated document details
        res.status(200).json({ id: bookId, ...updatedData });
    } catch (error) {
        res.status(500).send('Error updating book');
    }
});


//CHAPTERS POST GET PATCH-----------------------------------------------
app.get('/chapters/:bookId', async (req, res) => {
    const { bookId } = req.params;
    try {
        const snapshot = await db.collection('chapters').where('bookId', '==', bookId).get();
        const chapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(chapters);
    } catch (error) {
        res.status(500).send('Error fetching chapters');
    }
});

app.post('/chapters', async (req, res) => {
    const { title, content, chapterNum, bookId, draft } = req.body;
    try {
        const docRef = await db.collection('books').doc(bookId).collection('chapters').add({ title, content, chapterNum, bookId, draft });
        res.status(201).json({ id: docRef.id, title, content, chapterNum, bookId, draft });
    } catch (error) {
        res.status(500).send('Error creating chapter');
    }
});

app.patch('/chapters/:chapterId', async (req, res) => {
    //bookId required in this patch call
    const { chapterId } = req.params; // Extract the  ID from the URL parameter
    const { title, content, chapterNum, bookId, draft } = req.body; // Extract updated data from the request body

    // Prepare the data object to update
    const updatedData = {};

    if (title) updatedData.title = title;
    if (content) updatedData.content = content;
    if (chapterNum) updatedData.chapterNum = chapterNum;
    if (bookId) updatedData.bookId = bookId;
    if (draft) updatedData.draft = draft;

    try {
        // Update the document using the ID
        const docRef = db.collection('books').doc(bookId).collection('chapters').doc(chapterId);
        await docRef.update(updatedData);

        // Respond with the updated document details
        res.status(200).json({ id: chapterId, ...updatedData });
    } catch (error) {
        res.status(500).send('Error updating chapter');
    }
});

//USERS POST GET PATCH -----------------------------
app.get('/users', async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
});

app.post('/users', async (req, res) => {
    const { name, author, bio, books, bookmarks, following } = req.body;

    try {
        const docRef = await db.collection('users').add({ name, author, bio, books, bookmarks, following });
        res.status(201).json({ id: docRef.id, name, author, bio, books, bookmarks, following });
    } catch (error) {
        res.status(500).send('Error creating user');
    }
});

app.patch('/users/:userId', async (req, res) => {
    const { userId } = req.params; // Extract the ID from the URL parameter
    const { name, author, bio, books, bookmarks, following } = req.body; // Extract updated data from the request body

    // Prepare the data object to update
    const updatedData = {};

    if (name) updatedData.name = name;
    if (author) updatedData.author = author;
    if (bio) updatedData.bio = bio;
    if (books) updatedData.books = books;
    if (bookmarks) updatedData.bookmarks = bookmarks;
    if (following) updatedData.following = following;

    try {
        // Update the document using the ID
        const docRef = db.collection('users').doc(userId);
        await docRef.update(updatedData);

        // Respond with the updated document details
        res.status(200).json({ id: userId, ...updatedData });
    } catch (error) {
        res.status(500).send('Error updating user');
    }
});


// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});