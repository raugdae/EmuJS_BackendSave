const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {Pool} = require('pg');
const app = express();

const listeningPort = 80;


app.use(cors());
app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({limit:'100mb',extended :true, parameterlimit:1000000}));

const pool = new Pool({
    user:'jsemuuser',
    host:'192.168.50.12',
    database:'jsemudb',
    password: '+h3LL0W0rld-',
    port:5432
})

//
app.get('/api/savemanagement/getsavefile', async(req,res) => {
    const {gamefile} = requestAnimationFrame.query;

    console.log(gamefile);

    try{
        const query = "SELECT file_name,size,data FROM games WHERE fk_gamelist = (SELECT id FROM gamelist WHERE filename LIKE '"+gamefile+"') LIMIT 1";


        const result = await pool.query(query);

        if (result.rows.length === 0){
            return res.status(404),json({Message : 'save not found'});
        }
        res.status(200).json(result.rows);
    }
    catch (err){
        console.error('failed to get data from DB',err.message);
        res.status(500).json({message:'Server error'});
    }
});

app.post('/api/savemanagement/setsavefile', async(req, res) => {
    const {fileName, size, data, user, game} = req.body;

    try{
        const query = 'INSERT INTO games (file_name, size,data,fk_user,fk_gamelist) VALUES ($1, $2,$3::jsonb, $4, (SELECT id FROM gamelist WHERE filename = $5)) RETURNING *';
        const values = [fileName, size, JSON.stringify(data),user,game];
        const result = await pool.query(query,values);

        res.status(201).json({message : 'Insert file OK'});
    }
    catch (err){
        res.status(500).json({message : 'Server error', error:err.message});
    }

});

app.listen(listeningPort,() => console.log('API running on port : '+listeningPort))