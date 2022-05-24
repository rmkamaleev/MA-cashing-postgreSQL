const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");

const { calculateUserRang } = require("../redis-users");
const { getIntegerWithTheGivenDistribution } = require("./RNG");
const { getRandomName, getLastLoginDate, getLoginCountWeekly } = require("./helpers");

const { CONN_STRING, DB_NAME } = require("../config").db;
const {
  USERS_SCORE_RANGE,
  USERS_SCORE_RANGE_PROBABILITIES,
} = require("./constants");

const pool = new Pool({ connectionString: CONN_STRING });

// Getting the first and last names data
const firstAndLastNames = fs.readFileSync(path.join(__dirname, "names.json"), "utf-8");
const { firstNames, lastNames } = JSON.parse(firstAndLastNames);

const getDBUsersCount = async () => {
  const queryString = `SELECT COUNT(id) FROM ${DB_NAME}`;
  const queryResult = await pool.query(queryString);
  const usersCount = parseInt(queryResult.rows[0].count);
  return usersCount;
};

const insertRandomUsers = async (usersAmount) => {
  const start = `INSERT INTO ${DB_NAME} VALUES`;
  let dataFields = "";
  let userScore, firstName, lastName, email, lastLoginDate, loginCountWeekly;
  const passwordHash = bcrypt.hashSync("123U$Test", bcrypt.genSaltSync(10));

  const usersCount = await getDBUsersCount();

  for (let i = usersCount; i < usersCount + usersAmount; i++) {
    userScore = getIntegerWithTheGivenDistribution(
      USERS_SCORE_RANGE,
      USERS_SCORE_RANGE_PROBABILITIES
    );
    userRang = calculateUserRang(userScore);
    firstName = getRandomName(firstNames);
    lastName = getRandomName(lastNames);
    email = `${
      firstName.toLowerCase().replace(/\s/g, "") +
      lastName.toLowerCase().replace(/\s/g, "") +
      i
    }@mail.com`;
    lastLoginDate = getLastLoginDate(userScore);
    loginCountWeekly = getLoginCountWeekly(userScore);
    dataFields +=
      `(${i}, '${lastLoginDate}', '${email}', '${passwordHash}', ` +
      `'${firstName}', '${lastName}', ${userScore}, '${userRang}', ` +
      `${loginCountWeekly}), `;
  }

  const queryString = `${start} ${dataFields}`.slice(0, -2);

  try {
    await pool.query(queryString);
    console.log(`Success with the insert of the ${usersAmount} rows`);
  } catch (err) {
    console.error(`Error occured during the insert of the ${usersAmount} rows: ${err}`);
  }
};

const addUsersCyclic = async (cyclAmount) => {
  console.log("User generation procedure started");
  for (let i = 0; i < cyclAmount; i++) {
    console.log(`Iteration #${i}`);
    await insertRandomUsers(1000000);
  }
};

addUsersCyclic(121);
