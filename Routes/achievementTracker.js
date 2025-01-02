const {Pool} = require('pg');



async function updateAchievement({gameid},userId,data){
    console.log('entering achievement update');

    const temppool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database:process.env.DB_NAME,
        password: process.env.DB_PASS,
        port:5432,
        idleTimeoutMillis:30000,
    
        ssl: {
            rejectUnauthorized: false 
          }
    });
    //const {selectAchievementValues} = gameId;
    try {
    
        const gameId = gameid;
    console.log(gameid);
    //Fetching achievement from game
    const selectAchievementQuery = `SELECT id,memorylocation,waitedvalue FROM achievement WHERE fk_gamelist = $1`;
    const achievementList = await temppool.query(selectAchievementQuery,gameId);

    console.log('query returned');
    const listJson = achievementList.rows;
    
    console.log(listJson);

    return res.listJson;
    }
    catch (err){
        throw err;
    }



};


module.exports = {updateAchievement};

