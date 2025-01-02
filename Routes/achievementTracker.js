const pool = require('./../db');

async function updateAchievement(parameters){

    console.log('entering achievement update');
    
    const {userId,gameId,data} = parameters;

    
    //Fetching achievement from game
    const selectAchievementQuery = `SELECT id,memorylocation,waitedvalue FROM achievement WHERE fk_gamelist = (SELECT id FROM gamelist WHERE filename LIKE $1)`;
    const selectAchievementValues = [gameId];

    const achievementList = await pool.query(selectAchievementQuery,selectAchievementQuery);

    const listJson = achievementList.rows
    
    console.log(listJson);

    return res.listJson;



}

module.exports = {updateAchievement};

