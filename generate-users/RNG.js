const getIntegerWithTheGivenDistribution = (range, probablities) => {
  const randomNumber = Math.random();
  const lastIndex = range.length - 1;
  let probablitiesSum = 0;

  for (let i = 0; i < lastIndex; i++) {
    probablitiesSum += probablities[i];
    if (randomNumber < probablitiesSum) {
      return getRandomInt(range[i][0], range[i][1]);
    }
  }

  return getRandomInt(range[lastIndex][0], range[lastIndex][1]);
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


module.exports = {
    getIntegerWithTheGivenDistribution,
    getRandomInt
}
