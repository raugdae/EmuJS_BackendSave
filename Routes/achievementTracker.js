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
                }

                memorypointer += achievement.sizeinram
            }


            console.log(counter +':'+ achievement.totalvalue);
            if (counter = achievement.totalvalue){
                console.log('achievement unlocked')
                unlockedAchivement.push(achievement.id);
            }
        }
    });
    



    return unlockedAchivement;
};


module.exports = {updateAchievement};

