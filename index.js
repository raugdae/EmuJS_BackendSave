const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');

const saveRoutes = require('./Routes/saveRoutes');
const {userCreation} = require('./Routes/userController');
const authMiddleware = require('./Routes/authMiddleware');
const listeningPort = process.env.API_LISTENING_PORT;

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true, // Enable credentials (cookies, authorization headers, etc)
    maxAge: 86400 // Cache preflight request results for 24 hours
 }));

app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({limit:'100mb',extended :true, parameterlimit:1000000}));



// Public routes

app.get('/api/status',(req,res) => {res.status(200).json({message :"API Online"})});
app.post('/api/register', userCreation);


//protected routes

app.use('/api/savemanagement', authMiddleware, saveRoutes);


app.listen(listeningPort,() => console.log('API running on port : '+listeningPort))