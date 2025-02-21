/*
NOTES:
-we should plan to compartmentalize our routes that are contained in this file. What ive
seen most commonly is a "routes" folder and a "controllers" folder which contain all our logic necessary
to do any of the request handling (any structure is fine with me this is just a suggestion). 
This file will get messy soon and its probably just better for
readability purposes. For now just dump code in here if you need the backend changed and
we will fix it later.
*/

// Importing required modules
const { generateUploadURL } = require('./s3.js');
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

// Get Firestore reference
const firestore = admin.firestore();

// Image handling endpoint
app.get('/s3Url', async (req, res) => {
    try {
        const url = await generateUploadURL();
        console.log("hello this is it");
        console.log(url);
        res.json({ url });
    } catch (error) {
        console.error("Error generating S3 URL:", error);
        res.status(500).json({ error: 'Failed to generate signed URL' });
    }
 });
 

// Update profile picture URL endpoint
app.patch('/author/:authorId/profile_pic_url', async (req, res) => {
    try {
        const { authorId } = req.params;
        const { profilePicUrl } = req.body;

        if (!authorId || !profilePicUrl) {
            console.error("Missing authorId or profilePicUrl");
            return res.status(400).send('Missing authorId or profilePicUrl');
        }

        // Firestore update
        const authorRef = firestore.collection('authors').doc(authorId);
        await authorRef.update({ profile_pic_url: profilePicUrl });

        console.log("Profile picture updated successfully");
        return res.status(200).send('Profile picture updated successfully');
    } catch (error) {
        console.error('Error updating profile picture:', error);
        return res.status(500).send('Internal Server Error');
    }
});

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

app.patch('/authors/:authorId', async (req, res) => {
    const { authorId } = req.params;
    const { profile_pic_url } = req.body; // Allow updating profile picture

    const updatedData = {};

    if (profile_pic_url) updatedData.profile_pic_url = profile_pic_url;

    try {
        const docRef = db.collection('authors').doc(authorId);
        await docRef.update(updatedData);

        res.status(200).json({ id: authorId, ...updatedData });
    } catch (error) {
        res.status(500).send('Error updating author');
    }
});

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

//GET doesn't have any json requirements
//POST needs json containing all fields in req.body
//PATCH only needs json containing the fields being updated in req.body
//DELETE doesn't have any json requirements

//BOOKS POST GET PATCH DELETE -----------------------------
//use to return a list of all books, optional to limit the amount returned
//GET doesn't have any json requirements
//POST needs json containing all fields in req.body
//PATCH only needs json containing the fields being updated in req.body
//DELETE doesn't have any json requirements

//BOOKS POST GET PATCH DELETE -----------------------------
//use to return a list of all books, optional to limit the amount returned
app.get('/books', async (req, res) => {
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
});

//get a specific book
app.get('/books/:bookId', async (req, res) => {
    const { bookId } = req.params;
    try {
        const doc = await db.collection('books').doc(bookId).get();
        
        if (!doc.exists) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // NOTE: Need to create seeprate api call for getting book details from pulished and non published books? Or need to figure out how security works here
        // const bookData = doc.data();
        // if(!bookData.is_published) {
        //     return res.status(403).json({ message: 'Book not published' });
        // }

        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).send('Error fetching book');
    }
});

//add a book to do the database
app.post('/books', async (req, res) => {
    
    const {book_title, author, author_id, cover_image_url, genre_tags} = req.body;

    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
        return res.status(400).send('Missng auth token');
    }
    decodedToken = await admin.auth().verifyIdToken(token);

    
    const newBook = {
        book_title,
        is_published: false,
        author,
        author_id,
        genre_tags,
        num_chapters: 0,
        num_drafts: 0,
        date : "TODO",
        chapters: [],
        cover_image_url
    };


    try {
        const docRef = await db.collection('books').add(newBook);
        res.status(201).json({ id: docRef.id, book_title});
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
    if (is_published || !is_published) updatedData.is_published = is_published;
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


//CHAPTERS POST GET PATCH DELETE -----------------------------------------------
//get a list of all chapters for specified book
app.get('/books/:bookId/chapters', async (req, res) => {
    const { bookId } = req.params;
    try {
        const snapshot = await db.collection('books').doc(bookId).collection('chapters').orderBy("chapter_num").get();
        const chapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(chapters);
    } catch (error) {
        res.status(500).send('Error fetching chapters');
    }
});

//get a chapter by its chapter number from a specific book
app.get('/books/:bookId/chapters/:chapterId', async (req, res) => {
    const { bookId, chapterId } = req.params;
    try {
        const doc = await db.collection('books').doc(bookId).collection('chapters').doc(chapterId).get();
        if (!doc.exists) {
            return res.status(404).json({
                message: 'Chapter not found'
            });
        }
        res.json({
            id: doc.id,
            ...doc.data()
        });
    } catch (error) {
        res.status(500).send('Error fetching chapter');
    }
});

//add a new chapter for a specified book
app.post('/books/:bookId/chapters', async (req, res) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(400).send('Missing auth token');
    }


    const { bookId } = req.params;
    const { parent_id, is_draft, title, chapter_num, text } = req.body;
    try {

        decodedToken = await admin.auth().verifyIdToken(token);
        userID = decodedToken.uid;
    
        const doc = await db.collection('books').doc(bookId).get()
        const owner_author_id = doc.data().author_id
    
        if(owner_author_id !== userID){
            return res.status(401).send('Not allowed');
        }


        const docRef = await db.collection('books').doc(bookId).collection('chapters').add({ title, text, chapter_num});
        res.status(201).json({ id: docRef.id, parent_id, is_draft, title, chapter_num, text });
    } catch (error) {
        res.status(500).send('Error creating chapter');
    }
});

//edit an already existing chapter in a specified book
app.patch('/books/:bookId/chapters/:chapterId', async (req, res) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(400).send('Missing auth token');
    }

    const { bookId, chapterId } = req.params;
    const { parent_id, is_published, title, chapter_num, text } = req.body; 
    const updatedData = {};

    if (parent_id) updatedData.parent_id = parent_id;
    if (is_published != null) updatedData.is_published = is_published;
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
app.delete("/books/:bookId/chapters/:chapterId", async (req, res) => {
    const { bookId, chapterId } = req.params;
    try {
        await db.collection('books').doc(bookId).collection('chapters').doc(chapterId).delete();
        res.status(200).send(`Chapter '${chapterId}' from book '${bookId}' deleted`);
    } catch (error) {
        res.status(500).send(`Error deleting chapter '${chapterId}' from book '${bookId}'`);
    }
});

//AUTHORS POST GET PATCH DELETE -----------------------------
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

//get a specific author
app.get('/authors/:authorId', async (req, res) => {
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
});


//get all books from a specific author
app.get('/authors/:authorId/books', async (req, res) => {
    const { authorId } = req.params; 
    try {
        const snapshot = await db.collection('books').where('author_id', '==', authorId).get();
        const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(books);
    } catch (error) {
        res.status(500).send('Error fetching books');
    }
});

//add a new author to the database
app.post('/authors', async (req, res) => {
    const { first_name, last_name, email, location} = req.body;
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
        return res.status(400).send('Missng auth token');
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;

        // Add author data to Firestore with UID as the document ID
        const newAuthor = {
            first_name,
            last_name,
            email,
            location,
            bio: '',
            books_as_author: [],
            favorited_books: [], 
            following: [], 
            //CHANGE THIS, using the discord one for now
            profile_pic_url : "https://cdn.discordapp.com/attachments/1329527771168374890/1339748135957827685/file-LKDvfnHdmAnP55WdDj8jvM.png?ex=67afd92e&is=67ae87ae&hm=f3cfe98aafaa3870099d092e30bd3a297aa32c6ac1501b9600ae59197a057b29&"
        };

        await db.collection('authors').doc(uid).set(newAuthor);

        // Respond with the created author data
        res.status(201).json({ id: uid, first_name, last_name, email, location });
    } catch (error) {
        console.error('Error creating author:', error);
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