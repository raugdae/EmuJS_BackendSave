const express = require ('express');
const router = express.Router();
const pool = require('./../db');
const authMiddleware = require('./authMiddleware');
const fs = require('fs').promise


router.get('/updateromlist', async (req,res) =>{

    //const userId = req.user.UserId ;

    try {
        /*
        const queryIsUserAdmin = `SELECT userright AS role FROM users WHERE id = $1`;
        const queryIsUserAdminValue = [userId];

        const answerIsUserAdmin = await pool.query(queryIsUserAdmin,queryIsUserAdminValue);

        if (answerIsUserAdmin.rows.length === 0){
            return res.status(204).json({message : 'No user found'});
        }
        if (answerIsUserAdmin.rows[0].role != 'admin'){
            return res.status(401).json({message : 'insuffisant persmission'})
        }
        */
        const rootRomFolder = process.env.ROOT_ROM_FOLDER;

        console.log('path to scan :', rootRomFolder);
        
        let romScan = [];

        const files = await fs.readdir(rootRomFolder, {recursive:true,withFileTypes:true});

        

        files.array.forEach(element => {
            if (!element.isDirectory()){
                romScan.push({name : element.name, path: element.path})
            }
        });

        console.log(romScan);








    }
    catch (err) {
        console.log('Error on updateromlist :', err);
        return res.status(500).json({message : 'Internal server error'});
    }

});

module.exports = router;