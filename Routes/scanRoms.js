const express = require ('express');
const router = express.Router();
const pool = require('./../db');
const authMiddleware = require('./authMiddleware');
const fs = require('fs').promises;



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
        const pathToBoxArt = process.env.BOXART_PATH;
        const frotendRomPath = process.env.FRONTEND_ROM_PATH;

        console.log('path to scan :', rootRomFolder);
        
        let romScan = [];

        const files = await fs.readdir(rootRomFolder, {recursive:true,withFileTypes:true});

        const queryRomAlreadyExists = 'SELECT id FROM gamelist WHERE filename = $1';
        let queryRomAlreadyExistsValue;

        const queryListConsoles = 'SELECT id,shortname FROM device';
        const resultListConsoles = await pool.query(queryListConsoles);
        
        console.log(resultListConsoles.rows);

         for ( const element of files ){
            if (!element.isDirectory() && element.name != '.gitignore' && element.name != '.gitkeep'){

                queryRomAlreadyExistsValue = [element.name];

                const resultRomAlreadyExists = await pool.query(queryRomAlreadyExists,queryRomAlreadyExistsValue);

                if (resultRomAlreadyExists.rows.length === 0){
                    console.log('Preparing to add new rom :', element.name);
                    romScan.push({name : element.name, path: element.path});
                }
                    /*
                    else{
                        console.log('Rom already exists : ',element.name);
                    }*/
            }
        };
        

        console.log(romScan);
        
        const preparePayload = [];

        romScan.forEach( rom =>{

            console.log(rom.path.split('/')[3]);
            const findDeviceId = resultListConsoles.rows.find( device => device.shortname === rom.path.split('/')[3]);

            preparePayload.push ({
                title : null,
                boxArtPath : pathToBoxArt+rom.name.split('.')[0]+".jpg",
                year: null,
                console : rom.path.split('/')[3],
                consoleid : findDeviceId.id,
                developer : null,
                romPath: frotendRomPath+rom.path.split('/')[2]+rom.path.split('/')[3]+'/'+rom.name,
                categories:[null]

            })
        })

        console.log(preparePayload);

        return res.status(200).json({message : 'payload not ready'});

    }
    catch (err) {
        console.log('Error on updateromlist :', err);
        return res.status(500).json({message : 'Internal server error'});
    }

});

module.exports = router;