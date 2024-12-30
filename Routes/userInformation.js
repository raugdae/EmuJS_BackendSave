const express = require ('express');
const router = express.Router();
const pool = require('./../db');
const authMiddleware = require('./authMiddleware');
const { JsonWebTokenError } = require('jsonwebtoken');

router.get('/userprofile', authMiddleware , async(req,res) =>{
    const userId = req.user.userId;

    try {
        const query = 'SELECT users.nickname, users.email, users.creation_date, users.profile FROM users WHERE users.id = $1;'
        const value = [userId];

        const result = await pool.query(query,value);

        if (result.rows.length === 0){
            return res.status(404).json({message : 'User not found'});
        }
        console.log(result.rows);
        return res.status(200).json(result.rows[0]);


        
    }
    catch(err){
        return res.status(500).json({Message : 'Internal Error', Error:err});
    }


})

router.get('/userprofileextended', authMiddleware , async(req,res) =>{
    const userId = req.user.userId;

    try {
        const query = 'SELECT count(games.id) AS saves, users.nickname, users.email, users.profile FROM games LEFT JOIN users ON games.fk_user = users.id WHERE users.id = $1 GROUP BY (users.nickname,users.email,users.profile) ;'
        const value = [userId];

        const result = await pool.query(query,value);

        if (result.rows.length === 0){
            return res.status(404).json({message : 'User not found'});
        }
        console.log(result.rows);
        return res.status(200).json(result.rows[0]);


        
    }
    catch(err){
        return res.status(500).json({Message : 'Internal Error', Error:err});
    }


})
router.get('/usersavelist', authMiddleware , async(req,res) =>{
    const userId = req.user.userId;

    try {
        const query = 'select gamelist.name AS game, games.id, device.name AS Console, games.creation_date, games.change_date FROM gamelist LEFT JOIN games ON gamelist.id = games.fk_gamelist LEFT JOIN device ON gamelist.fk_device = device.id WHERE games.fk_user = $1;'
        const value = [userId];

        const result = await pool.query(query,value);

        if (result.rows.length === 0){
            return res.status(404).json({message : 'User not found'});
        }
        console.log(result.rows);
        return res.status(200).json(result.rows[0]);


        
    }
    catch(err){
        return res.status(500).json({Message : 'Internal Error', Error:err});
    }
});

    router.get('/userdeletesave', authMiddleware , async(req,res) =>{
        const saveId = req.saveId;
        const userId = req.user.userId;
    
        try {
            const query = 'DELETE FROM games WHERE id = $1 AND fk_user=$2'
            const value = [saveId,userId];
    
            const result = await pool.query(query,value);
    
            if (result.rows.length === 0){
                return res.status(404).json({message : 'User not found'});
            }
            console.log(result.rows);
            return res.status(200).json(result.rows[0]);
    
    
            
        }
        catch(err){
            return res.status(500).json({Message : 'Internal Error', Error:err});
        }
    });




module.exports = router;