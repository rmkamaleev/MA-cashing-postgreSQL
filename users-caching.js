const redis = require("redis");
const fs = require("fs");
const { Pool } = require("pg");
const { CONN_STRING, DB_NAME } = require("./config").db;
const {
  USERS_INDEXES_RANGE,
  USERS_INDEXES_RANGE_PROBABILITIES
} = require("./generate-users/constants");

const { getIntegerWithTheGivenDistribution, getRandomInt } = require("./generate-users/RNG");
const { delay } = require("./time");

const pool = new Pool({ connectionString: CONN_STRING });

const client = redis.createClient();

async function initRedis() {
  try {
    await client.connect();
    console.log("Redis connection successfull");
  } catch (ex) {
    console.error(`Redis connection failed: ${ex}`);
  }
}

async function flushRedisDb() {
  try {
    const resFlush = await client.flushDb();
    console.log("Flushed the redis DB");
    return resFlush;
  } catch (ex) {
    console.error(`Error occured during the flush of the Redis DB: ${ex}`);
  }
}

async function saveUsersDataToCache() {
  try {
    const usersDataForCaching = await getUsersDataForCaching();

    const cachedUsersIDs = usersDataForCaching.map((user) => user.id);
    fs.writeFileSync("cached-userIDs.json", JSON.stringify({ cachedUsersIDs }));

    const propValueArray = usersDataForCaching.map((user, index) => {
      return [user.id, 
        JSON.stringify({
          leaderBoardPlace: `#${index+1}`,
          ...user
        })
      ];
    });

    await client.mSet(propValueArray);
    console.log("Saved top 10000 users data to cache");
    return "success";
  } catch (ex) {
    console.error(`Error occured during users data saving to the cache: ${ex}`);
    return "failure";
  }
}

async function saveTopUsersInCache(limit) {
  try {
    const topUsersFetchResult = await getTopUsers(limit);

    const propValueArray = topUsersFetchResult.users.map((el, index) => {
      return [`#${index+1}`, JSON.stringify(el)];
    });

    await client.mSet(propValueArray);
    console.log(`Saved top ${limit} users to cache`);
    return "success";
  } catch (ex) {
    console.error(`Error occured during top ${limit} users saving to the cache: ${ex}`);
    return "failure";
  }
}

async function getUserByIdFromCache(userId) {
  try {
    const startTime = new Date().getTime();
    const clientString = await client.get(userId);
    const clientParsed = JSON.parse(clientString);
    const diffTime = new Date().getTime() - startTime;
    return {
      user: clientParsed,
      fetchTime: diffTime,
    };
  } catch (ex) {
    console.error(
      `Error occured during the fetch of the user from cache: ${ex}`
    );
    return null;
  }
}

async function getTopUsersFromCache(limit) {
  try {
    const startTime = new Date().getTime();
    const topUsersKeys = Array.from({length: limit}, (value, index) => `#${index+1}`);
    const users = await client.mGet(topUsersKeys);
    const usersParsed = users.map((user) => JSON.parse(user));
    const diffTime = new Date().getTime() - startTime;
    return {
      users: usersParsed,
      fetchTime: diffTime,
    };
  } catch (ex) {
    console.error(
      `Error occured during the fetch of the top ${limit} users from cache: ${ex}`
    );
    return null;
  }
}

async function getRandomUsersFromCache(limit) {
  try {
    const userIDs = getRandomCachedUsersIDs(limit);
    const startTime = new Date().getTime();
    const users = await client.mGet(userIDs);
    const usersParsed = users.map((user) => JSON.parse(user));
    const diffTime = new Date().getTime() - startTime;
    return {
      users: usersParsed,
      fetchTime: diffTime,
    };
  } catch (ex) {
    console.error(
      `Error occured during the fetch of the random ${limit} users from cache: ${ex}`
    );
    return null;
  }
}

// USER MANAGEMENT LOGIC

async function getUserById(userId) {
  try {
    const startTime = new Date().getTime();
    const queryString = `SELECT * FROM ${DB_NAME} WHERE id = ${userId}`;
    const result = await pool.query(queryString);
    const diffTime = new Date().getTime() - startTime;
    return result && result.rowCount
      ? {
          user: result.rows[0],
          fetchTime: diffTime,
        }
      : null;
  } catch (ex) {
    console.error(
      `Error occured during the fetch of the user by id=${userId}: ${ex}`
    );
    return null;
  }
}

async function getUserScoreDataById(userId) {
  try {
    const queryString = `SELECT "userScore", "userRang" FROM ${DB_NAME} WHERE id = ${userId}`;
    const result = await pool.query(queryString);
    return result && result.rowCount ? result.rows[0] : null;
  } catch (ex) {
    console.error(
      `Error occured during the fetch of the user score data by id=${userId}: ${ex}`
    );
    return null;
  }
}

async function getUsersDataForCaching() {
  try {
    const queryString = 
      `SELECT id, "userScore", "userRang" FROM ${DB_NAME} ORDER BY "userScore" DESC LIMIT 10000`;
    const result = await pool.query(queryString);
    return result && result.rowCount ? result.rows : null;
  } catch (ex) {
    console.error(`Error occured during the fetch of the users data for caching: ${ex}`);
    return null;
  }
}

async function getAllCachedUsersData() {
  try {
    const queryString = 
      `SELECT id, "userScore", "userRang", "lastLoginDate", "loginCountWeekly" FROM ${DB_NAME} ` +
      'ORDER BY "userScore" DESC LIMIT 10000';
    const result = await pool.query(queryString);
    return result && result.rowCount ? result.rows : null;
  } catch (ex) {
    console.error(`Error occured during the fetch of the cached users data: ${ex}`);
    return null;
  }
}

async function getTopUsers(limit) {
  try {
    console.log(`Fetching top ${limit} users from DB`);
    const startTime = new Date().getTime();
    const queryString = `SELECT * FROM ${DB_NAME} ORDER BY "userScore" DESC LIMIT ${limit}`;
    const result = await pool.query(queryString);
    const diffTime = new Date().getTime() - startTime;
    console.log("Fetch successfull!");
    return result && result.rowCount
      ? {
          users: result.rows,
          fetchTime: diffTime,
        }
      : null;
  } catch (ex) {
    console.error(`Error occured during the fetch of the top 100 users: ${ex}`);
    return null;
  }
}

async function getRandomUsers(limit) {
  try {
    const userIDs = getRandomCachedUsersIDs(limit);
    const startTime = new Date().getTime();
    const userIDsString = userIDs.join(",");
    const queryString = `SELECT * FROM ${DB_NAME} ` +
      `WHERE id IN (${userIDsString})`
    const result = await pool.query(queryString);
    const diffTime = new Date().getTime() - startTime;
    return result && result.rowCount
      ? {
          users: result.rows,
          fetchTime: diffTime,
        }
      : null;
  } catch (ex) {
    console.error(
      `Error occured during the fetch of the random ${limit} users from DB: ${ex}`
    );
    return null;
  }
}

async function changeRandomUsersScore() {
  try {
    console.log("Changing the userScore of the random users...");
    const usersData = await getAllCachedUsersData();
    const usersAmount = getRandomInt(500, 1000);
    let userIndex, userScoreChange, newUserScore, userId, operationSign;

    const dataToChange = {
      userIds: [],
      userScores: [],
      leaderBoardPlaces: [],
      lastLoginDates: [],
      loginCountsWeekly: []
    };

    for (let i = 0; i < usersAmount; i++) {
      operationSign = getRandomInt(0, 1) === 1 ? 1 : -1;
      userScoreChange = getRandomInt(200, 400);
      userIndex = getIntegerWithTheGivenDistribution(USERS_INDEXES_RANGE, USERS_INDEXES_RANGE_PROBABILITIES);
      userId = usersData[userIndex].id;
      newUserScore = usersData[userIndex].userScore + userScoreChange * (operationSign);
      dataToChange.userIds.push(userId);
      dataToChange.userScores.push(newUserScore);
      dataToChange.leaderBoardPlaces.push(userIndex + 1);
      dataToChange.lastLoginDates.push(usersData[userIndex].lastLoginDate);
      dataToChange.loginCountsWeekly.push(usersData[userIndex].loginCountWeekly);
    }

    const usersDataUpdatePromises = dataToChange.userIds.map((userId, index) => {
      return updateScoreDataOfTheUser(
        userId, // ID of the user
        dataToChange.userScores[index], // userScore of the user
        dataToChange.leaderBoardPlaces[index], // place of the user in top 10000 players
        dataToChange.lastLoginDates[index], // lastLoginDate of the user
        dataToChange.loginCountsWeekly[index] // loginCountWeekly of the user
      );
    });

    await Promise.all(usersDataUpdatePromises);
    console.log("Users data successfully updated");
  } catch (ex) {
    console.error(`Error occured during the change of the random users score`);
  }
}

async function updateScoreDataOfTheUser(
  userId,
  userScore,
  leaderBoardPlace,
  lastLoginDate,
  loginCountWeekly
) {
  try {
    const userRang = calculateUserRang(userScore);

    const queryString = `UPDATE ${DB_NAME} ` + 
      `SET "userScore" = ${userScore}, "userRang" = '${userRang}' ` +
      `WHERE id = ${userId}`;

    await pool.query(queryString);

    // Cache data update logic
    cachInvalidationProcedure(
      userId,
      userScore,
      userRang,
      leaderBoardPlace,
      lastLoginDate,
      loginCountWeekly
    );
  } catch (ex) {
    console.error(`Error occured during the update score data of the user: ${ex}`);
  }
}

async function asyncDataChange() {
  console.log("AsyncDataChange procedure started");
  let iter = 5;
  let awaitTime;

  while (iter !== 0) {
    awaitTime = getRandomInt(3*60, 15*60);
    await delay(awaitTime);
    await changeRandomUsersScore();
    iter--;
  }
}

async function cachInvalidationProcedure(
  userId,
  userScoreOriginal,
  userRangOriginal,
  leaderBoardPlace,
  lastLoginDate,
  loginCountWeekly
) {
  console.log("Cache invalidation procedure started");
  if (
    leaderBoardPlace <= 100 ||
    (leaderBoardPlace > 100 &&
      leaderBoardPlace <= 1000 &&
      loginCountWeekly > 75 &&
      moment(NEW_SERVER_LAUNCH_DATE).isSame(lastLoginDate))
  ) {
    console.log("Updating cache for user immediately");
    await client.set(
      userId,
      JSON.stringify({
        userScore: userScoreOriginal,
        userRang: userRangOriginal,
        leaderBoardPlace, // may be invalid, but save it anyway
      })
    );
    console.log(`Updated cache for user ${userId} with userScore = ${userScore}`);
  } else {
    if (
      leaderBoardPlace > 100 &&
      leaderBoardPlace <= 1000 &&
      ((loginCountWeekly < 75 &&
        moment(NEW_SERVER_LAUNCH_DATE).isSame(lastLoginDate)) ||
        (loginCountWeekly > 75 &&
          moment(NEW_SERVER_LAUNCH_DATE).isAfter(lastLoginDate)))
    ) {
      console.log("Waiting 2 minuntes before the cache update");
      await delay(120); // waiting 2 mins before the cache update
    }

    if (
      leaderBoardPlace > 100 &&
      leaderBoardPlace <= 1000 &&
      loginCountWeekly < 75 &&
      moment(NEW_SERVER_LAUNCH_DATE).isAfter(lastLoginDate)
    ) {
      console.log("Waiting 3 minuntes before the cache update");
      await delay(180); // waiting 3 mins before the cache update
    }

    if (
      leaderBoardPlace > 1000 &&
      leaderBoardPlace <= 5000 &&
      loginCountWeekly > 65 &&
      moment(NEW_SERVER_LAUNCH_DATE).isSame(lastLoginDate)
    ) {
      console.log("Waiting 4 minuntes before the cache update");
      await delay(240); // waiting 4 mins before the cache update
    }

    if (
      leaderBoardPlace > 1000 &&
      leaderBoardPlace <= 5000 &&
      ((loginCountWeekly < 65 &&
        moment(NEW_SERVER_LAUNCH_DATE).isSame(lastLoginDate)) ||
        (loginCountWeekly > 65 &&
          moment(NEW_SERVER_LAUNCH_DATE)
            .subtract(1, "days")
            .isSame(lastLoginDate)))
    ) {
      console.log("Waiting 6 minuntes before the cache update");
      await delay(360); // waiting 6 mins before the cache update
    }

    if (
      leaderBoardPlace > 1000 &&
      leaderBoardPlace <= 5000 &&
      ((loginCountWeekly < 65 &&
        moment(NEW_SERVER_LAUNCH_DATE)
          .subtract(1, "days")
          .isSame(lastLoginDate)) ||
        (loginCountWeekly > 65 &&
          moment(NEW_SERVER_LAUNCH_DATE)
            .subtract(2, "days")
            .isSame(lastLoginDate)))
    ) {
      console.log("Waiting 8 minuntes before the cache update");
      await delay(480); // waiting 8 mins before the cache update
    }

    if (
      leaderBoardPlace > 1000 &&
      leaderBoardPlace <= 10000 &&
      ((loginCountWeekly < 65 &&
        moment(NEW_SERVER_LAUNCH_DATE)
          .subtract(2, "days")
          .isSame(lastLoginDate)) ||
        (loginCountWeekly > 57 &&
          moment(NEW_SERVER_LAUNCH_DATE)
            .subtract(1, "days")
            .isSame(lastLoginDate)))
    ) {
      console.log("Waiting 10 minuntes before the cache update");
      await delay(600); // waiting 10 mins before the cache update
    }

    if (
      leaderBoardPlace > 5000 &&
      leaderBoardPlace <= 10000 &&
      ((loginCountWeekly > 57 &&
        moment(NEW_SERVER_LAUNCH_DATE)
          .subtract(2, "days")
          .isSame(lastLoginDate)) ||
        (loginCountWeekly < 57 &&
          moment(NEW_SERVER_LAUNCH_DATE)
            .subtract(1, "days")
            .isSame(lastLoginDate)))
    ) {
      console.log("Waiting 12 minuntes before the cache update");
      await delay(720); // waiting 12 mins before the cache update
    }

    if (
      leaderBoardPlace > 5000 &&
      leaderBoardPlace <= 10000 &&
      ((loginCountWeekly < 57 &&
        moment(NEW_SERVER_LAUNCH_DATE)
          .subtract(2, "days")
          .isSame(lastLoginDate)) ||
        (loginCountWeekly > 57 &&
          moment(NEW_SERVER_LAUNCH_DATE)
            .subtract(3, "days")
            .isSame(lastLoginDate)))
    ) {
      console.log("Waiting 20 minuntes before the cache update");
      await delay(1200); // waiting 20 mins before the cache update
    }

    if (
      leaderBoardPlace > 5000 &&
      leaderBoardPlace <= 10000 &&
      loginCountWeekly < 57 &&
      moment(NEW_SERVER_LAUNCH_DATE).subtract(3, "days").isSame(lastLoginDate)
    ) {
      console.log("Waiting 30 minuntes before the cache update");
      await delay(1800); // waiting 30 mins before the cache update
    }

    const { userScore, userRang } = await getUserScoreDataById(userId);
    await client.set(
      userId,
      JSON.stringify({
        userScore,
        userRang,
        leaderBoardPlace, // may be invalid, but save it anyway
      })
    );
    console.log(`Updated cache for user ${userId} with userScore = ${userScore}`);
  }
}

const calculateUserRang = (userScore) => {
  if (userScore >= 0 && userScore < 300000) {
    return "Newbie";
  }
  if (userScore >= 300000 && userScore < 700000) {
    return "Amateur";
  }
  if (userScore >= 700000 && userScore < 850000) {
    return "Veteran";
  }
  if (userScore >= 850000 && userScore < 950000) {
    return "Professional";
  }
  if (userScore >= 950000) {
    return "Master";
  }
};

const getRandomCachedUsersIDs = (limit) => {
  const cachedUsersIDs = fs.readFileSync("cached-userIDs.json", "utf-8");
  const IDsArray = JSON.parse(cachedUsersIDs).cachedUsersIDs;
  let userIDs = []; let index;

  for (let i = 0; i < parseInt(limit); i++) {
    do {
      // Generating random index until it is unique
      index = getRandomInt(0, IDsArray.length - 1);      
    } while (userIDs.includes(index));
    userIDs.push(IDsArray[index]);
  }

  return userIDs;
}

module.exports = {
  getUserById,
  getTopUsers,
  getRandomUsers,
  changeRandomUsersScore,
  asyncDataChange,
  calculateUserRang,
  client,
  initRedis,
  flushRedisDb,
  saveUsersDataToCache,
  saveTopUsersInCache,
  getUserByIdFromCache,
  getTopUsersFromCache,
  getRandomUsersFromCache
};