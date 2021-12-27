const { Pool } = require("pg");

const db = {};
const connectionString = "postgres://postgres:123@localhost:5432/postgres"; // localhost PG_SQL conn string
const DB_NAME = 'public."cashingApp_usersnew"';
db.pool = new Pool({ connectionString });

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const POSSIBLE_RANGS = [
  "Newbie",
  "Amateur",
  "Veteran",
  "Professional",
  "Master",
];

const getUserRang = (userScore) => {
  if (userScore >= 0 && userScore < 300) {
    return "Newbie";
  }
  if (userScore >= 300 && userScore < 700) {
    return "Amateur";
  }
  if (userScore >= 700 && userScore < 850) {
    return "Veteran";
  }
  if (userScore >= 850 && userScore < 950) {
    return "Professional";
  }
  if (userScore >= 950) {
    return "Master";
  }
};

const getDBUsersCount = async () => {
  const queryString = `SELECT COUNT(id) FROM ${DB_NAME}`;
  const queryResult = await db.pool.query(queryString);
  const usersCount = parseInt(queryResult.rows[0].count);
  return usersCount;
}

const insertRandomUsers = async (usersAmount) => {
  const start = `INSERT INTO ${DB_NAME} VALUES`;
  let dataFields = "";
  let userScore;
  const usersCount = await getDBUsersCount();
  for (let i = usersCount; i < usersCount + usersAmount; i++) {
    userScore = getRandomInt(0, 1000);
    userRang = getUserRang(userScore);
    dataFields += `(${i}, ${i}, ${userScore}, 'Firstname${i}', 'Lastname${i}', '${userRang}'), `;
  }
  const queryString = `${start} ${dataFields}`.slice(0, -2);
  try {
    await db.pool.query(queryString);
    console.log(`Success with the insert of the ${usersAmount} rows`);
  } catch (err) {
    console.log(`Error occured: ${err}`);
  }
};

insertRandomUsers(6000000);
