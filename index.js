const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');
const authRoutes = require('./Routes/auth');
const authenticateToken = require('./Routes/authMiddleware');

const saveRoutes = require('./Routes/saveRoutes');
const listeningPort = process.env.API_LISTENING_PORT;



const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
 }));
 


app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({limit:'100mb',extended :true, parameterlimit:1000000}));

 // Additional headers for broader access
 app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    next();
 });



app.use('/api/savemanagement', saveRoutes);
app.use('/api/auth',authRoutes);


app.listen(listeningPort,() => console.log('API running on port : '+listeningPort))