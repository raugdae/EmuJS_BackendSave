function updateAchievement(achievementList,data){
    console.log('entering achievement update');

    achievementList.forEach(achievement => {
        
        console.log(achievement);
        if (achievement.achievementccondition === 'binarycheck'){
            console.log ('Achievement is binary compare');
        }
        if (achievement.achievementccondition === 'counter'){
            console.log ('Achievement is binary compare');
        }
    });
    



    return true;
};


module.exports = {updateAchievement};

