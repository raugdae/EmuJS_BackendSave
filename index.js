const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');
const authRoutes = require('./Routes/auth');
const authenticateToken = require('./Routes/authMiddleware');


const app = express();
app.use(cors({credentials:true,
    methods:['GET','POST'],
    allowedHeaders: 'Content-Type,Authorization'
}));

const saveRoutes = require('./Routes/saveRoutes');

const listeningPort = process.env.API_LISTENING_PORT;


app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({limit:'100mb',extended :true, parameterlimit:1000000}));
app.use('/api/savemanagement', saveRoutes);

app.listen(listeningPort,() => console.log('API running on port : '+listeningPort))