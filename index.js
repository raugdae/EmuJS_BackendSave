const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');

const saveRoutes = require('./Routes/saveRoutes');
const userRoutes = require('./Routes/userController');
const authMiddleware = require('./Routes/authMiddleware');
const scanRoms = require('./Routes/scanRoms');

const userData = require('./Routes/userInformation');
const listeningPort = process.env.API_LISTENING_PORT;

const app = express();

const corsOptions = {
   origin:'*',
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
   credentials: true,
   maxAge: 86400
};

app.use(cors(corsOptions));

// Middleware pour les headers CORS
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
   res.header('Access-Control-Allow-Credentials', 'true');
   
   if (req.method === 'OPTIONS') {
       return res.status(200).end();
   }
   next();
});

app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({limit:'100mb',extended :true, parameterlimit:1000000}));



// Public routes

app.get('/api/status',(req,res) => {res.status(200).json({message :"API Online"})});
app.use('/api', userRoutes);
app.use('/api/roms',scanRoms);


//protected routes

app.use('/api/savemanagement', saveRoutes);
app.use('/api/user', userData);


app.listen(listeningPort,() => console.log('API running on port : '+listeningPort))