const express = require ('express');
const router = express.Router();
const pool = require('./../db');
const authMiddleware = require('./authMiddleware');


router.get('/getsavefile', authMiddleware, async(req,res) => {

    const {gamefile} = req.query;
    const userId = req.user.id;

    console.log(userId);
    
    try{
        const query = "SELECT file_name,size,data FROM games WHERE fk_gamelist = (SELECT id FROM gamelist WHERE filename LIKE $1) AND fk_user =$2";
        const value = [gamefile,userId];
        const result = await pool.query(query,value);

        if (result.rows.length === 0){
            console.log("No savefile found");
            return res.status(404);
        }
        res.status(200).json(result.rows);
    }
    catch (err){
        console.error('failed to get data from DB',err.message);
        res.status(500).json({message:'Server error'});
    }
});


router.get('/savefileexists', authMiddleware,async(req,res) => {

    const {fileName} = req.body;
    const userId = req.user.id;
    

    console.log(userId);

    try{
        const query = 'SELECT id FROM games WHERE fk_user = $1 AND fk_gamelist = (SELECT id FROM gamelist WHERE filename LIKE $2)';
        const values =[userId, fileName];
        const result = await pool.query(query,values);

        if (result.rows.length === 0){
            
            res.status(404);
        }

        res.status(200).json(result.rows);
        //console.log(result.rows[0]);
        

    }catch (err){
        res.status(500).json({message : 'error on request', error : err});
    }

});


router.post('/setsavefile', authMiddleware, async(req, res) => {
    const {fileName, size, data, game} = req.body;
    const userId = req.user.id;
    

    try{
        const query = 'INSERT INTO games (file_name, size,data,fk_user,fk_gamelist) VALUES ($1, $2,$3::jsonb, $4, (SELECT id FROM gamelist WHERE filename = $5)) RETURNING *';
        const values = [fileName, size, JSON.stringify(data),userId,game];
        const result = await pool.query(query,values);

        res.status(201).json({message : 'Insert file OK'});
    }
    catch (err){
        res.status(500).json({message : 'Server error', error:err.message});
    }

});

router.post('/updatesavefile', authMiddleware, async (req, res) =>{

    const {saveid, size, data,} = req.body;

    try{
        const query = 'UPDATE games SET size = $2, data = $3::jsonb WHERE id = $1';
        const values = [saveid,size,JSON.stringify(data)];

        console.log(values);

        const result = await pool.query(query,values);
    

        res.status(201).json({message : 'Savefile updated'});
    }
    catch (err){
        res.status(500).json({message : 'Server error', error:err.message});
    }

});


module.exports = router;