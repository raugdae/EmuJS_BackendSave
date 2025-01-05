function updateAchievement(achievementList,data){
    //console.log('entering achievement update');
    let unlockedAchivement = [];

    achievementList.forEach(achievement => {
        console.log (data[achievement.memorylocation]);
        //console.log(achievement);
        if (achievement.achievementcondition === 'binarycheck'){
            //console.log ('Achievement is binary compare');
            

            if (data[achievement.memorylocation] === achievement.waitedvalue){
                unlockedAchivement.push(achievement.id);
            }

        }
        if (achievement.achievementcondition === 'counter'){
            console.log ('Achievement is binary compare');
        }
    });
    



    return unlockedAchivement;
};


module.exports = {updateAchievement};

