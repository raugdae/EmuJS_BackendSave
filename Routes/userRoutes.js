const express = require('express');
const router = express.Router();

router.get('/api', async(req,res) =>{
    res.status(200).json({message : 'API user online'});
});

