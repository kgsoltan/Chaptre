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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});