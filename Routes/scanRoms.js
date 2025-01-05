const express = require ('express');
const router = express.Router();
const pool = require('./../db');
const authMiddleware = require('./authMiddleware');
const fs = require('fs').promises;



router.get('/checknewroms', authMiddleware, async (req,res) =>{

    res.header('Cache-Contro', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires','0');

    const userId = req.user.userId;
    console.log('Entering checkroms : ', userId);

    try {
        
        const queryIsUserAdmin = `SELECT userright AS role FROM users WHERE id = $1`;
        const queryIsUserAdminValue = [userId];

        const answerIsUserAdmin = await pool.query(queryIsUserAdmin,queryIsUserAdminValue);

        if (answerIsUserAdmin.rows.length === 0){
            return res.status(204).json({message : 'No user found'});
        }
        if (answerIsUserAdmin.rows[0].role != 'admin'){
            return res.status(403).json({message : 'insuffisant persmission'})
        }
        
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
                romPath: frotendRomPath+rom.path.split('/')[2]+'/'+rom.path.split('/')[3]+'/'+rom.name,
                categories:[null]

            })
        })

        //console.log(preparePayload);

        const payloadJsonified = JSON.stringify(preparePayload);

        console.log(payloadJsonified);

        return res.status(200).json(preparePayload);

    }
    catch (err) {
        console.log('Error on updateromlist :', err);
        return res.status(500).json({message : 'Internal server error'});
    }

});

router.post('/registernewroms', authMiddleware,async(req,res) =>{
    const inputdata = req.body;

    try {
    const queryInsertRom = 'INSERT INTO gamelist (name, fielname, fk_device, boxartpath, yearsofdistribution,develper,rompath,categorie) VALUES ($1,$2,$3,$4,$5,$6,$7)';
    const queryInsertRomValue = [inputdata.title,inputdata.romPath.split('/')[3],inputdata.deviceid,inputdata.boxArtPath,inputdata.year,inputdata.developer,inputdata.romPath,inputdata.categories];

    const resultInsertRomValue = await pool.query(queryInsertRom,queryInsertRomValue);

    res.status(200).json({message : 'New roms recorded'});

    }
    catch (err){
        console.log("regisetering rom error : ",err)
        res.status(500).json({message : 'Internal server error'});
    }

});

router.post('/getromslist', authMiddleware, async (req,res) => {

    try{

        const querygetroms = `SELECT gamelist.name AS title, gamelist.boxartpath AS boxArtPath, gamelist.yearofdistribution AS year, device.shortname AS console, gamelist.developer as developer, gamelist.rompath AS rompath, gamelist.categorie AS categorie 
                                FROM gamelist 
                                LEFT JOIN device ON gamelist.fk_device = device.id`;

        return res.send(200).json({message : 'endpoint not ready'})
    }
    catch (err)
    {
        return res.send(500).json({messaage : 'Internal server error'});
    }

});

module.exports = router;