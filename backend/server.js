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
    const { title, authorId } = req.body;
    try {
        const docRef = await db.collection('books').add({ title, authorId });
        res.status(201).json({ id: docRef.id, title, authorId });
    } catch (error) {
        res.status(500).send('Error creating book');
    }
});


//CHAPTERS POST AND GET -----------------------------------------------
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
    const { title, content, bookId } = req.body;
    try {
        const docRef = await db.collection('chapters').add({ title, content, bookId });
        res.status(201).json({ id: docRef.id, title, content, bookId });
    } catch (error) {
        res.status(500).send('Error creating chapter');
    }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});