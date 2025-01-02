const pool = require('./../db');

async function updateAchievement(gameId,userId,data){
    console.log('entering achievement update');
    try {
    
        console.log([gameId]);
    
    //Fetching achievement from game
    const selectAchievementQuery = `SELECT id,memorylocation,waitedvalue FROM achievement WHERE fk_gamelist = $1;`;
    const selectAchievementValues = [gameId];

    console.log('sending query');
    const achievementList = await pool.query(selectAchievementQuery,selectAchievementValues);

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

