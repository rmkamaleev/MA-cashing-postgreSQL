
const moment = require("moment");
const momentRandom = require("moment-random");
const { NEW_SERVER_LAUNCH_DATE } = require("../config");

const { getRandomInt } = require("./RNG");

const getRandomName = (names) => {
  const index = getRandomInt(0, names.length - 1);

  // Making sure our name is not empty
  if (!names[index]) {
    return getRandomName(names);
  }

  return names[index];
};

const getLastLoginDate = (userScore) => {
  let startDate, endDate;

  if (userScore <= 300000) {
    startDate = moment(NEW_SERVER_LAUNCH_DATE).subtract(6, "days");
    endDate = moment(NEW_SERVER_LAUNCH_DATE);
  } else if (userScore <= 700000) {
    startDate = moment(NEW_SERVER_LAUNCH_DATE).subtract(11, "days");
    endDate = moment(NEW_SERVER_LAUNCH_DATE).subtract(3, "days");
  } else if (userScore <= 900000) {
    startDate = moment(NEW_SERVER_LAUNCH_DATE).subtract(4, "days");
    endDate = moment(NEW_SERVER_LAUNCH_DATE).subtract(2, "days");
  } else if (userScore <= 990000) {
    startDate = moment(NEW_SERVER_LAUNCH_DATE).subtract(4, "days");
    endDate = moment(NEW_SERVER_LAUNCH_DATE).subtract(1, "days");
  } else if (userScore <= 995000) {
    startDate = moment(NEW_SERVER_LAUNCH_DATE).subtract(3, "days");
    endDate = moment(NEW_SERVER_LAUNCH_DATE).subtract(1, "days");
  } else if (userScore <= 999000) {
    startDate = moment(NEW_SERVER_LAUNCH_DATE).subtract(2, "days");
    endDate = moment(NEW_SERVER_LAUNCH_DATE);
  } else if (userScore <= 1000000) {
    startDate = moment(NEW_SERVER_LAUNCH_DATE).subtract(1, "days");
    endDate = moment(NEW_SERVER_LAUNCH_DATE);
  }

  const date = momentRandom(endDate, startDate).format("DD.MM.YYYY");
  return date;
};

const getLoginCountWeekly = (userScore) => {
  let startCount, endCount;

  if (userScore <= 300000) {
    startCount = 20;
    endCount = 30;
  } else if (userScore <= 700000) {
    startCount = 0;
    endCount = 7;
  } else if (userScore <= 900000) {
    startCount = 30;
    endCount = 35;
  } else if (userScore <= 990000) {
    startCount = 40;
    endCount = 50;
  } else if (userScore <= 995000) {
    startCount = 55;
    endCount = 60;
  } else if (userScore <= 999000) {
    startCount = 60;
    endCount = 70;
  } else if (userScore <= 1000000) {
    startCount = 70;
    endCount = 80;
  }

  const loginCountWeekly = getRandomInt(startCount, endCount);
  return loginCountWeekly;
};


module.exports = {
    getRandomName,
    getLastLoginDate,
    getLoginCountWeekly
}