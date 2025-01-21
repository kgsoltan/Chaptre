const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

//Middleware
app.use(cors());
app.use(bodyParser.json());

//test route
app.get('/', (req, res) => {
    res.send('Hello! Backend is running!');
});

//start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});