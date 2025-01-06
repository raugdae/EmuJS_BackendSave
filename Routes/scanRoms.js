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
    //console.log('Entering checkroms : ', userId);

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

        //console.log('path to scan :', rootRomFolder);
        
        let romScan = [];

        const files = await fs.readdir(rootRomFolder, {recursive:true,withFileTypes:true});

        const queryRomAlreadyExists = 'SELECT id FROM gamelist WHERE filename = $1';
        let queryRomAlreadyExistsValue;

        const queryListConsoles = 'SELECT id,shortname FROM device';
        const resultListConsoles = await pool.query(queryListConsoles);
        
        //console.log(resultListConsoles.rows);

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
        
        //console.log(romScan);
        
        const preparePayload = [];

        romScan.forEach( rom =>{

            //console.log(rom.path.split('/')[3]);
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

        //console.log(payloadJsonified);

        return res.status(200).json(preparePayload);

    }
    catch (err) {
        console.log('Error on updateromlist :', err);
        return res.status(500).json({message : 'Internal server error'});
    }

});

router.post('/registernewroms', authMiddleware,async(req,res) =>{
    const inputdata = req.body;
    console.log('Recieved payload : ', inputdata);

    try {
    const queryInsertRom = 'INSERT INTO gamelist (name, filename, fk_device, boxartpath, yearofdistribution,developer,rompath,categorie) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)';
    const queryInsertRomValue = [inputdata.title,inputdata.romPath.split('/')[4],inputdata.consoleid,inputdata.boxArtPath,inputdata.year,inputdata.developer,inputdata.romPath,inputdata.categories];

    const resultInsertRomValue = await pool.query(queryInsertRom,queryInsertRomValue);
    
    res.status(200).json({message : 'New roms recorded'});

    }
    catch (err){
        console.log("regisetering rom error : ",err)
        res.status(500).json({message : 'Internal server error'});
    }

});

router.get('/getromslist', authMiddleware, async (req,res) => {

    try{

    

        const queryGetRoms = `SELECT gamelist.name AS title, gamelist.filename AS filename, gamelist.boxartpath, gamelist.yearofdistribution AS year, device.shortname AS console, gamelist.developer as developer, gamelist.rompath, gamelist.categorie AS categorie 
                                FROM gamelist 
                                LEFT JOIN device ON gamelist.fk_device = device.id`;

        const responseGetRoms = await pool.query(queryGetRoms);

        //console.log (responseGetRoms.rows);

        let preparePayload = [];

        //console.log('prepare payload');
        responseGetRoms.rows.forEach(rom => {



            //console.log('current game : ',rom);
            preparePayload.push ({
                title : rom.title ?? null,
                boxArtPath : rom.boxartpath ?? null,
                year: rom.year ?? null,
                console : rom.console ?? null,
                developer : rom.developer ?? null,
                romPath: rom.rompath ?? null,
                categories:rom.categories ?? null,
                filename : rom.filename?? null

            });
        });

        //console.log(preparePayload);
        return res.status(200).json(preparePayload)
    }
    catch (err)
    {
        return res.status(500).json({messaage : 'Internal server error'});
    }

});

router.post('/updateromdata', authMiddleware, async (req,res) =>{

    const inputData = req.body;
    console.log('update data : ',inputData);

    try {

        const fileName = inputData.romPath.split('/')[3];
        console.log(fileName);
        const queryUpdateRomData = `UPDATE gamelist SET name = $1, boxartpath = $3, yearofdistribution = $4, developer = $5, rompath = $6, categorie = $7
                                    WHERE filename = $2`;
        const queryUpdateRomDataValue = [inputData.title,fileName,inputData.boxArtPath,inputData.year,inputData.developer,inputData.romPath,inputData.categories];

        const resultUpdateRomData = pool.query(queryUpdateRomData,queryUpdateRomDataValue);

        return res.status(200).json({message : 'Row in DB updated'})

    }
    catch (err){
        console.log('update rom data :', err)
        return res.status(500).json({message : 'Internal server error'});
    }

});

module.exports = router;