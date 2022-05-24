
// MODULE CREATED FOR TESTING THE DATA GENERATION SUBFUNCTIONS

const { USERS_SCORE_RANGE, USERS_SCORE_RANGE_PROBABILITIES } = require("./constants");
const { getIntegerWithTheGivenDistribution } = require("./RNG");
const { getLastLoginDate, getLoginCountWeekly } = require("./helpers");


const calculateProbability = (scoreArray) => {
  let elementsAmountRangedByScore = [
    0, // amount of elements with score <= 200000
    0, // amount of elements with score <= 400000
    0, // amount of elements with score <= 700000
    0, // amount of elements with score <= 900000
    0, // amount of elements with score <= 950000
    0, // amount of elements with score <= 970000
    0, // amount of elements with score <= 990000
    0  // amount of elements with score <= 1000000
  ];

  for (let i = 0; i < scoreArray.length; i++) {
    if (scoreArray[i] <= 200000) {
      elementsAmountRangedByScore[0]++;
    } else if (scoreArray[i] <= 400000) {
      elementsAmountRangedByScore[1]++;
    } else if (scoreArray[i] <= 700000) {
      elementsAmountRangedByScore[2]++;
    } else if (scoreArray[i] <= 900000) {
      elementsAmountRangedByScore[3]++;
    } else if (scoreArray[i] <= 950000) {
      elementsAmountRangedByScore[4]++;
    } else if (scoreArray[i] <= 970000) {
      elementsAmountRangedByScore[5]++;
    } else if (scoreArray[i] <= 990000) {
      elementsAmountRangedByScore[6]++;
    } else if (scoreArray[i] <= 1000000) {
      elementsAmountRangedByScore[7]++;
    }
  }

  const probabilities = elementsAmountRangedByScore.map((elemAmount) => {
    return elemAmount / scoreArray.length;
  });
  console.log(probabilities);
};

// Testing the getLastLoginDate function
const scoreArray = [];
for (let i = 0; i < 100000; i++) {
  scoreArray.push(
    getIntegerWithTheGivenDistribution(
      USERS_SCORE_RANGE,
      USERS_SCORE_RANGE_PROBABILITIES
    )
  );
}

calculateProbability(scoreArray);

// Testing the getLastLoginDate function
for (let i = 0; i < 10; i++) {
    console.log(getLastLoginDate(999000));
}

// Testing the getLoginCountWeekly function
for (let i = 0; i < 10; i++) {
    console.log(getLoginCountWeekly(600000));
}