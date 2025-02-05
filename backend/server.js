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
//GET doesn't have any json requirements
//POST needs json containing all fields in req.body
//PATCH only needs json containing the fields being updated in req.body
//DELETE doesn't have any json requirements

//BOOKS POST, GET, AND PATCH -----------------------------
//use to return a list of all books
app.get('/books', async (req, res) => {
    try {
        const snapshot = await db.collection('books').get();
        const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(books);
    } catch (error) {
        res.status(500).send('Error fetching books');
    }
});

//add a book to do the database
app.post('/books', async (req, res) => {
    const { book_title, is_published, author, author_id, num_chapters, num_drafts, date, cover_image_url, genre_tags } = req.body;
    try {
        const docRef = await db.collection('books').add({ book_title, is_published, author, author_id, num_chapters, num_drafts, date, cover_image_url, genre_tags });
        res.status(201).json({ id: docRef.id, book_title, is_published, author, author_id, num_chapters, num_drafts, date, cover_image_url, genre_tags });
    } catch (error) {
        res.status(500).send('Error creating book');
    }
});

//use to edit already exsiting books
app.patch('/books/:bookId', async (req, res) => {
    const { bookId } = req.params;
    const { book_title, is_published, author, author_id, num_chapters, num_drafts, date, cover_image_url, genre_tags } = req.body;

    const updatedData = {};

    if (book_title) updatedData.book_title = book_title;
    if (is_published) updatedData.is_published = is_published;
    if (author) updatedData.author = author;
    if (author_id) updatedData.author_id = author_id
    if (num_chapters) updatedData.num_chapters = num_chapters;
    if (num_drafts) updatedData.num_drafts = num_drafts;
    if (date) updatedData.date = date;
    if (cover_image_url) updatedData.cover_image_url = cover_image_url;
    if (genre_tags) updatedData.genre_tags = genre_tags;

    try {
        const docRef = db.collection('books').doc(bookId);
        await docRef.update(updatedData);

        res.status(200).json({ id: bookId, ...updatedData });
    } catch (error) {
        res.status(500).send('Error updating book');
    }
});

//delete an existing book
app.delete("/books/:bookId", async (req, res) => {
    const { bookId } = req.params;

    const bookRef = db.collection("books").doc(bookId);
    const chaptersRef = bookRef.collection("chapters");
    
    //add all doc references to batch for deletion
    const batch = db.batch();
    const chaptersSnapshot = await chaptersRef.get();
    if (!chaptersSnapshot.empty) {
            chaptersSnapshot.forEach((doc) => { batch.delete(doc.ref); });
        }
    batch.delete(bookRef);

    try {
        await batch.commit();
        res.status(200).send(`Book '${bookId}' deleted`);
    } catch (error) {
        res.status(500).send(`Error deleting book '${bookId}'`);
    }
});


//CHAPTERS POST GET PATCH-----------------------------------------------
//get a list of all chapters for specified book
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

//add a new chapter for a specified book
app.post('/chapters/:bookId', async (req, res) => {
    const { bookId } = req.params;
    const { parent_id, is_draft, title, chapter_num, text } = req.body;
    try {
        const docRef = await db.collection('books').doc(bookId).collection('chapters').add({ parent_id, is_draft, title, chapter_num, text });
        res.status(201).json({ id: docRef.id, parent_id, is_draft, title, chapter_num, text });
    } catch (error) {
        res.status(500).send('Error creating chapter');
    }
});

//edit an already existing chapter in a specified book
app.patch('/chapters/:bookId/:chapterId', async (req, res) => {
    const { bookId, chapterId } = req.params;
    const { parent_id, is_draft, title, chapter_num, text } = req.body; 

    const updatedData = {};

    if (parent_id) updatedData.parent_id = parent_id;
    if (is_draft) updatedData.is_draft = is_draft;
    if (title) updatedData.title = title;
    if (chapter_num) updatedData.chapter_num = chapter_num;
    if (text) updatedData.text = text

    try {
        const docRef = db.collection('books').doc(bookId).collection('chapters').doc(chapterId);
        await docRef.update(updatedData);

        res.status(200).json({ id: chapterId, ...updatedData });
    } catch (error) {
        res.status(500).send('Error updating chapter');
    }
});

//delete an existing chapter in a specified book
app.delete("/chapters/:bookId/:chapterId", async (req, res) => {
    const { bookId, chapterId } = req.params;
    try {
        await db.collection('books').doc(bookId).collection('chapters').doc(chapterId).delete();
        res.status(200).send(`Chapter '${chapterId}' from book '${bookId}' deleted`);
    } catch (error) {
        res.status(500).send(`Error deleting chapter '${chapterId}' from book '${bookId}'`);
    }
});

//AUTHORS POST GET PATCH -----------------------------
//get a list of all authors
app.get('/authors', async (req, res) => {
    try {
        const snapshot = await db.collection('authors').get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching authors');
    }
});

//add a new author to the database
app.post('/authors', async (req, res) => {
    const { first_name, last_name, email, bio, location, profile_pic_url, books, bookmarks, following } = req.body;

    try {
        const docRef = await db.collection('authors').add({ first_name, last_name, email, bio, location, profile_pic_url, books, bookmarks, following });
        res.status(201).json({ id: docRef.id, first_name, last_name, email, bio, location, profile_pic_url, books, bookmarks, following });
    } catch (error) {
        res.status(500).send('Error creating author');
    }
});

//edit an already existing author
app.patch('/authors/:authorId', async (req, res) => {
    const { authorId } = req.params;
    const { first_name, last_name, email, bio, location, profile_pic_url, books, bookmarks, following } = req.body; 

    const updatedData = {};

    if (first_name) updatedData.first_name = first_name;
    if (last_name) updatedData.last_name = last_name;
    if (email) updatedData.email = email;
    if (bio) updatedData.bio = bio;
    if (location) updatedData.location = location;
    if (profile_pic_url) updatedData.profile_pic_url = profile_pic_url;
    if (books) updatedData.books = books;
    if (bookmarks) updatedData.bookmarks = bookmarks;
    if (following) updatedData.following = following;

    try {
        const docRef = db.collection('authors').doc(authorId);
        await docRef.update(updatedData);

        res.status(200).json({ id: authorId, ...updatedData });
    } catch (error) {
        res.status(500).send('Error updating author');
    }
});

//delete an existing author
app.delete("/authors/:authorId", async (req, res) => {
    const { authorId } = req.params;
    try {
        await db.collection('authors').doc(authorId).delete();
        res.status(200).send(`Author '${authorId}' deleted`);
    } catch (error) {
        res.status(500).send(`Error deleting author '${authorId}'`);
    }
});


// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});