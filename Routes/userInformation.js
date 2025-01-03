const express = require ('express');
const router = express.Router();
const pool = require('./../db');
const path = require('path');
const authMiddleware = require('./authMiddleware');
const { JsonWebTokenError } = require('jsonwebtoken');
const multer = require('multer');
const storage = multer.diskStorage({ dest: 'uploads/' , 
    filename: (req, file, cb) => {
        cb(null,);
    }
});
const upload = multer({storage});

router.get('/userprofile', authMiddleware , async(req,res) =>{
    const userId = req.user.userId;

    try {

        const value = [userId];
        let userdata;


        const haveSavefile = 'SELECT * FROM games WHERE fk_user = $1;'
        const saveFileList = await pool.query(haveSavefile,value);


        if (saveFileList.rows.length === 0)
        {
            userdata = 'SELECT users.nickname, users.email, users.creation_date, users.profile, users.id FROM users WHERE users.id = $1;';
            
        }else{

            userdata = 'SELECT count(games.id) AS saves, users.nickname, users.email, users.profile, users.creation_date, users.id FROM games LEFT JOIN users ON games.fk_user = users.id WHERE users.id = $1 GROUP BY (users.id,users.nickname,users.email,users.profile,users.creation_date) ;'
        }

        const result = await pool.query(userdata,value);

        console.log(result.rows);

        if (result.rows.length === 0){
            return res.status(404).json({message : 'User not found'});
        }

        return res.status(200).json(result.rows[0]);
        
    }
    catch(err){
        console.log(err);
        return res.status(500).json({Message : 'Internal Error', Error:err});
    }


})
router.get('/usersavelist', authMiddleware , async(req,res) =>{
    const userId = req.user.userId;

    try {
        const query = 'select gamelist.name AS game, games.id, device.name AS Console, games.creation_date, games.change_date FROM gamelist LEFT JOIN games ON gamelist.id = games.fk_gamelist LEFT JOIN device ON gamelist.fk_device = device.id WHERE games.fk_user = $1 ORDER BY games.change_date ASC;'
        const value = [userId];

        const result = await pool.query(query,value);

        if (result.rows.length === 0){
            return res.status(200).json({message : 'No save file found'});
        }
        //console.log(result.rows);
        return res.status(200).json(result.rows);
    }
    catch(err){
        return res.status(500).json({Message : 'Internal Error'});
    }
});

    router.delete('/userdeletesave', authMiddleware , async(req,res) =>{
        const saveId = req.body.id;
        const userId = req.user.userId;
    
        try {


            const query = 'DELETE FROM games WHERE id = $1 AND fk_user= $2'
            const value = [saveId,userId];
    
            const result = await pool.query(query,value);
            
            return res.status(200).json({message : 'Save File delete... ->x.x<-'});
    
    
            
        }
        catch(err){
            return res.status(500).json({Message : 'Internal Error', Error:err});
        }
    });
    router.post('/updateprofile', authMiddleware, async(req,res) => {

        const {profileText} = req.body;
        const userId = req.user.userId;

        console.log(userId, profileText);

        try{
            const query = 'UPDATE users SET profile = $1 WHERE id = $2;'
            const value = [profileText,userId];

            const result = await pool.query(query,value);

            return res.status(200).json(result);
        }
        catch (err){
            return res.status(500).json({Message : 'Internal Error', Error:err});
        }
    });
    router.get('/getprofilepic'),authMiddleware,async(req,res) =>{
        const userId = req.user.userId;

        try {
            const query = 'SELECT picpath FROM users WHERE id = $1;';
            const value = [userId];

            const result = await pool.query(query,value);

            if (result.rows.length === 0){
                return res.status(204).json();
            }
            
            return res.status(200).json(result.rows[0]);


        }catch {
            return res.status(500).json({Message : 'Internal error'});
        }

    };

    router.post('/startplaying', authMiddleware, async (req,res) =>{

        const userId = req.user.userId;
        const {gameName} = req.body;

        console.log ("enter timestamp", userId, gameName);

        try {

            const query = 'INSERT INTO playinghistory (fk_user, fk_game) VALUES ($1, (SELECT id FROM gamelist WHERE filename = $2)) RETURNING id;'
            const values = [userId,gameName];

            const result = await pool.query(query,values);
            
            console.log(result.rows[0]);

            return res.status(201).json(result.rows[0]);

        }
        catch (err){
            return res.status(500).json({Message : 'Internal Error',Error:err});
        }

    });
    router.post('/stopplaying', authMiddleware, async (req,res) =>{

        

        const userId = req.user.userId;
        const {historyId} = req.body;

        console.log("enter stop time", userId, historyId);

        try {

            const query = 'UPDATE playinghistory SET stoptime = CURRENT_TIMESTAMP WHERE id = $1 AND fk_user = $2;';
            const values = [historyId,userId];

            const result = await pool.query(query,values);

            return res.status(200).json({message : 'Record Updated'});

        }
        catch (err){
            return res.status(500).json({Message : 'Internal Error',Error:err});
        }

    });

    router.get('/getplayedtime', authMiddleware, async (req,res) =>{

        const userId = req.user.userId;

        try {
            const query = `SELECT gamelist.name AS gamename, SUM(playinghistory.stoptime - playinghistory.starttime) AS playedtime
                            FROM playinghistory
                            LEFT JOIN users ON playinghistory.fk_user = users.id
                            LEFT JOIN gamelist ON playinghistory.fk_game = gamelist.id
                            WHERE users.id = $1
                            GROUP BY users.nickname, gamelist.name
                            ORDER BY playedtime desc`;
            const values = [userId];

            const result = await pool.query(query,values);

            console.log(result.rows);

            if (result.rows.length === 0){
                return res.status(204).json();
            }
            return res.status(201).json(result.rows);
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({Message : 'Internal Error', error : error})
        }

    });
    router.get('/getachievement', authMiddleware, async(req,res) =>{

        const userId = req.user.userId;

        try{
            const getAchievementQuery = `select users.nickname,achievement.achievementname,users_achievement.unlockdate FROM users_achievement 
                                        LEFT JOIN achievement ON users_achievement.fk_achievement = achievement.id
                                        LEFT JOIN users ON users_achievement.fk_user = users.id
                                        WHERE users.id = $1`;
            
            const responseAchievement = await pool.query(getAchievementQuery,[userId]);

            console.log(responseAchievement.rows);

            if (result.rows.length === 0){
                return res.status(200).json({message : "No achievement unlocked"});
            }
            return res.status(200).json(responseAchievement.rows);
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({message : 'Internal Error'});
        }

    });

    router.post('/uploadavatar',authMiddleware,upload.single('image'), async(req,res) =>{
        console.log("dans ton cul");
        return res.status(200).json({message:'File uploaded'});
    
    });

    router.get('/getavatar', authMiddleware, (req,res) => {
        const imagePath =  path.join(__dirname, 'uploads', req.user.userId);
        return res.sendFile(imagePath);
    })

module.exports = router;