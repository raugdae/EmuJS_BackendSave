function updateAchievement(achievementList,data){
    //console.log('entering achievement update');

    achievementList.forEach(achievement => {
        
        //console.log(achievement);
        if (achievement.achievementcondition === 'binarycheck'){
            //console.log ('Achievement is binary compare');
            console.log (data.rows[achievement.memorylocation]);
            if (data[achievement.memorylocation] === achievement.waitedvalue){
                return achievement.id;
            }

        }
        if (achievement.achievementcondition === 'counter'){
            console.log ('Achievement is binary compare');
        }
    });
    



    return true;
};


module.exports = {updateAchievement};

