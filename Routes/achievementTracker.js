function updateAchievement(achievementList, data) {
  let unlockedAchivement = [];
  console.log(achievementList.rows);
  achievementList.forEach((achievement) => {
    if (achievement.achievementcondition === "binarycheck") {
      //console.log ('Achievement is binary compare');

      console.log(
        data[achievement.memorylocation] + ":" + achievement.waitedvalue
      );

      if (data[achievement.memorylocation] === achievement.waitedvalue) {
        unlockedAchivement.push(achievement.id);
      }
    }
    if (achievement.achievementcondition === "counter") {
      let counter = 0;
      let memorypointer = achievement.memorylocation;

      for (let i = 0; i <= achievement.rangeinram; i++) {
        if (data[memorypointer] === achievement.waitedvalue) {
          counter++;
        }

        memorypointer += achievement.sizeinram;
      }

      console.log(counter + ":" + achievement.totalvalue);
      if (counter >= achievement.totalvalue) {
        //console.log("achievement unlocked");
        unlockedAchivement.push(achievement.id);
      }
    }
    if (achievement.achievementcondition === "bitcheck") {
    
      const bitvalue =
        (data[achievement.memorylocation] >> achievement.bittocheck-1) & 1;

      //console.log(bitvalue);

      if (bitvalue) {
        //console.log("Achivement bitwyse unlocked");
        unlockedAchivement.push(achievement.id);
      }
    }
    if (achievement.achievementcondition === 'summig'){
        
        console.log('achievement summing')
        let summedvalue = 0;
        let memorypointer = achievement.memorylocation;

        for (let i = 0; i <= achievement.rangeinram;i++){
            summedvalue += data[memorypointer];
            console.log('Collected in level : ',data[memorypointer]);
            memorypointer += achievement.sizeinram;
        }

        console.log('Coins total : ', summedvalue);
        if (summedvalue >= achievement.totalvalue){
            unlockedAchivement.push(achievement.id);
        }

    }
  });

  return unlockedAchivement;
}

module.exports = { updateAchievement };
