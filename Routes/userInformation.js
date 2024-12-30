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

module.exports = router;