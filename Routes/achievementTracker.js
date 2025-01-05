function updateAchievement(achievementList,data){
    let unlockedAchivement = [];

    achievementList.forEach(achievement => {
        
        if (achievement.achievementcondition === 'binarycheck'){
            //console.log ('Achievement is binary compare');
            

            if (data[achievement.memorylocation] === achievement.waitedvalue){
                unlockedAchivement.push(achievement.id);
            }

        }
        if (achievement.achievementcondition === 'counter'){
            let counter = 0;
            let memorypointer = achievement.memorylocation;

            for (let i = 0; i <= achievement.rangeinram; i++){

                if (data[memorypointer] === achievement.waitedvalue){
                    counter++;
                    console.log('its a match');
                }

                memorypointer += achievement.sizeinram
            }


            console.log(achievement.totalvalue);
            if (counter === achievement.totalvalue){
                unlockedAchivement.push(achievement.id);
            }
        }
    });
    



    return unlockedAchivement;
};


module.exports = {updateAchievement};

