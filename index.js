const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');
const authRoutes = require('./Routes/auth');
const authenticateToken = require('./Routes/authMiddleware');


const app = express();

const saveRoutes = require('./Routes/saveRoutes');

const listeningPort = process.env.API_LISTENING_PORT;

app.use(cors({origin : *,
    credentials:true,
    methods:['GET','POST'],
    allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({limit:'100mb',extended :true, parameterlimit:1000000}));
app.use('/api/savemanagement', saveRoutes);

app.listen(listeningPort,() => console.log('API running on port : '+listeningPort))