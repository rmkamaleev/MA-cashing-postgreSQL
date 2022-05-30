const path = require("path");
const express = require("express");
const fs = require("fs");
const app = express();


const {
  getUserById,
  getTopUsers,
  getRandomUsers,
  changeRandomUsersScore,
  asyncDataChange,
  initRedis,
  flushRedisDb,
  getUserByIdFromCache,
  getTopUsersFromCache,
  getRandomUsersFromCache,
  saveUsersDataToCache,
  saveTopUsersInCache,
  consoleLog,
  checkRangAndScoreDiscrepancies,
  calculateSavedCalles
} = require("./users-caching");


app.get("/", (req, res) => {
  res.send({ root: "Welcome!" });
});


app.get("/user/:id", async (req, res) => {
  const userCachedData = await getUserByIdFromCache(req.params.id);

  if (!userCachedData.user) {
    consoleLog("Didn't find data in cache, pullling from DB");
    const userFetchData = await getUserById(req.params.id);
    return res.send({ userFetchData });
  }

  return res.send({ userCachedData });
});

app.get("/user/db/:id", async (req, res) => {
  const userFetchData = await getUserById(req.params.id);
  res.send({ userFetchData });
});

app.get("/user/cache/:id", async (req, res) => {
  const userFetchData = await getUserByIdFromCache(req.params.id);
  res.send({ userFetchData });
});

app.get("/change-users-score", async (req, res) => {
  try {
    await changeRandomUsersScore();
    res.sendStatus(200);
  } catch (ex) {
    console.error(`Error occured during the users score update: ${ex}`);
    res.sendStatus(500);
  }
});

app.get("/save-users-to-cache", async (req, res) => {
  const result = await saveUsersDataToCache();
  res.send({ result });
});

app.get("/save-top-cache", async (req, res) => {
  const result = await saveTopUsersInCache(req.query.limit);
  res.send({ result });
});

app.get("/get-top-users-cache", async (req, res) => {
  const result = await getTopUsersFromCache(req.query.limit);
  res.send({ result });
});

app.get("/get-random-users-cache", async (req, res) => {
  const result = await getRandomUsersFromCache(req.query.limit);
  res.send({ result });
});

app.get("/get-top-users", async (req, res) => {
  const result = await getTopUsers(req.query.limit);
  res.send({ result });
});

app.get("/get-random-users", async (req, res) => {
  const result = await getRandomUsers(req.query.limit);
  res.send({ result });
});

app.get("/check-discrepancies", async (req, res) => {
  await checkRangAndScoreDiscrepancies();
  res.sendStatus(200);
})

app.get("/check-saved-calls", async (req, res) => {
  await calculateSavedCalles();
  res.sendStatus(200);
})

app.get("/flush-redis-db", async (req, res) => {
  const flushRes = await flushRedisDb();
  res.send({ flushRes });
});

app.listen(5000, async () => {
  await initRedis();
  consoleLog("Application listening on port 5000!");

  const MODE = process.argv.slice(2)[0].split("--")[1];

  if (MODE === "caching") {
    consoleLog("Launch standard caching mode");
    fs.writeFileSync("changedUsers.txt", "");
    fs.writeFileSync("logs.log", "");
    await saveUsersDataToCache();
    asyncDataChange();
  } else {
    consoleLog("Launch analyzis mode");
    await checkRangAndScoreDiscrepancies();
    await calculateSavedCalles();
  }
});
