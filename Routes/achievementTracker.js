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
            let counter;
            let memorypointer = achievement.memorylocation;
            for (const i = 0; i <= achievement.rangeinram; i++){

                if (data[memorypointer] === achievement.waitedvalue){
                    counter++;
                }

                memorypointer += achievement.sizeinram
            }

            if (counter === achievement.totalvalue){
                unlockedAchivement.push(achievement.id);
            }
        }
    });
    



    return unlockedAchivement;
};


module.exports = {updateAchievement};

