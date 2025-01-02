const pool = require('./../db');

async function updateAchievement(gameId,userId,data){
    console.log('entering achievement update');
    try {
    

    
    //Fetching achievement from game
    const selectAchievementQuery = `SELECT id,memorylocation,waitedvalue FROM achievement WHERE fk_gamelist = (SELECT id FROM gamelist WHERE filename LIKE $1)`;
    const selectAchievementValues = [gameId];

    const achievementList = await pool.query(selectAchievementQuery,selectAchievementQuery);

    const listJson = achievementList.rows
    
    console.log(listJson);

    return res.listJson;
    }
    catch (err){
        throw err;
    }



};
async function cul(){
    return "huehue";
};

module.exports = {updateAchievement,cul};

