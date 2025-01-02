const express = require ('express');
const router = express.Router();
const pool = require('./../db');
const authMiddleware = require('./authMiddleware');
//const achievementTracker = require('./achievementTracker');


router.get('/getsavefile', authMiddleware, async(req,res) => {

    const {gamefile} = req.query;
    const userId = req.user.userId;

    console.log(userId);
    
    try{
        const query = "SELECT file_name,size,data FROM games WHERE fk_gamelist = (SELECT id FROM gamelist WHERE filename LIKE $1) AND fk_user =$2";
        const value = [gamefile,userId];
        const result = await pool.query(query,value);

        if (result.rows.length === 0){
            console.log("No savefile found");
            return res.status(404).json({message:"No savefile found"});
        }
        return res.status(200).json(result.rows);
    }
    catch (err){
        console.error('failed to get data from DB',err.message);
        res.status(500).json({message:'Server error'});
    }
});


router.get('/savefileexists', authMiddleware ,async(req,res) => {

    console.log('Entering savefilecheck API');

    const {fileName} = req.query;
    const userId = req.user.userId;

    //console.log(fileName);
    //console.log(userId);
    

    try{
        const query = 'SELECT id FROM games WHERE fk_user = $1 AND fk_gamelist = (SELECT id FROM gamelist WHERE filename LIKE $2)';
        const values =[userId, fileName];
        const result = await pool.query(query,values);

        if (result.rows.length === 0){
            
            res.status(404);
        }
        //console.log(result);
        return res.status(200).json(result.rows[0]);
        
        

    }catch (err){
        res.status(500).json({message : 'error on request', error : err});
    }

});


router.post('/setsavefile', authMiddleware, async(req, res) => {
    const {fileName, size, data, game} = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!fileName || !size || !data || !game) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
   
    try {
        // First check if the game exists
        const checkGameQuery = 'SELECT id FROM gamelist WHERE filename = $1';
        const gameCheck = await pool.query(checkGameQuery, [game]);
        
        if (gameCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Game not found in gamelist' });
        }

        const query = `
            INSERT INTO games (file_name, size, data, fk_user, fk_gamelist) 
            VALUES ($1, $2, $3::jsonb, $4, (SELECT id FROM gamelist WHERE filename = $5)) 
            RETURNING *`;
        
        const values = [fileName, size, JSON.stringify(data), userId, game];
        const result = await pool.query(query, values);
        
        return res.status(201).json({ message: 'Insert file OK' });
    }
    catch (err) {
        console.error('Database error:', err);  // Log the full error
        
        // Send more specific error messages based on the error type
        if (err.code === '23505') {  // Unique violation
            return res.status(409).json({ 
                message: 'Save file already exists',
                error: err.message 
            });
        } else if (err.code === '23503') {  // Foreign key violation
            return res.status(400).json({ 
                message: 'Invalid game or user reference',
                error: err.message 
            });
        } else if (err.code === '22P02') {  // Invalid text representation
            return res.status(400).json({ 
                message: 'Invalid data format',
                error: err.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error', 
            error: err.message 
        });
    }
});

router.post('/updatesavefile', authMiddleware, async (req, res) =>{

    const {saveid, size, data,} = req.body;
    const userId = req.user.userId;

    try{
        const query = 'UPDATE games SET size = $2, data = $3::jsonb, change_date = CURRENT_TIMESTAMP WHERE id = $1';
        const values = [saveid,size,JSON.stringify(data)];

        //Updating savefile
        const result = await pool.query(query,values);


        //preparing data for Achivement update 
        const queryGameId = 'SELECT id AS gameId from gamelist WHERE id = (SELECT fk_gamelist FROM games WHERE id = $1)';
        const queryGameIdValues = [saveid];

        const resultGameId = await pool.query(queryGameId,queryGameIdValues);
        const gameId = resultGameId.rows[0].gameid;
       
        console.log('sending to function');
        console.log(gameId);
        console.log(userId);

        // achievement check
        const selectAchievementQuery = 'SELECT id, memorylocation, waitedvalue FROM achievement WHERE fk_gamelist = $1 ';
        const selectAchivementQueryValues = [gameId];

        console.log(selectAchivementQueryValues);

        const recordAchievementQuery = 'INSERT INTO users_achievement (fk_user,fk_achievement) VALUES ($1,$2) ON CONFLICT (fk_user, fk_achievement) DO NOTHING;'
        let recordAchievementValues;

        const resultAchievementQuery = await pool.query(selectAchievementQuery,selectAchivementQueryValues);
        
        resultAchievementQuery.rows.forEach( async achievement => {
            let saveMemoryValue = data[achievement.memorylocation];

            console.log(saveMemoryValue);

            if (saveMemoryValue === achievement.waitedvalue){
                recordAchievementValues = [userId,achievement.id];

                const resultRecordAchievementQuery = await pool.query(recordAchievementQuery,recordAchievementValues)
                console.log(resultRecordAchievementQuery.rows);
            }
        });



        console.log(resultAchievementQuery.rows);
        

        return res.status(201).json({message : 'Savefile updated'});
    }
    catch (err){
        res.status(500).json({message : 'Server error', error:err.message});
    }

});

router.post('/deletesave', authMiddleware, async(req,res) =>{

    const {saveId} = req.body;
    const userId = req.user.userId;

        try{
            const query = 'DELETE FROM games WHERE id = $1 AND fk_user = $2;';
            const values = [saveId,userId]

            const result = await pool.query(query,values);

            return res.status(201).json({message : 'Savefile Deleted'});
        }catch (err){
            return res.status(500).json({message : "Server Failure",Error: err});

        }

});


module.exports = router;