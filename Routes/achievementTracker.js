function updateAchievement(achievementList,data){
    //console.log('entering achievement update');

    achievementList.forEach(achievement => {
        console.log (data.rows[0]);
        //console.log(achievement);
        if (achievement.achievementcondition === 'binarycheck'){
            //console.log ('Achievement is binary compare');
            

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

