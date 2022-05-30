const axios = require("axios");

const baseURL = "http://localhost:5000";

const usersAmount = [
    5000,
    8000,
    10000
]

const testGetRandomUsers = async (usersAmount, retriesAmount) => {
    console.log("TestGetRandomUsers started");
    let elapsedTimeCache, elapsedTimeDB;
    let meanTimeCache = [], meanTimeDB = [];
    let userFetchResult, userFetchResultFromCache;

    for (let i = 0; i < usersAmount.length; i++) {
        console.log(`Fetching ${usersAmount[i]}`);
        elapsedTimeCache = []; elapsedTimeDB = [];

        try {
            for (let j = 0; j < retriesAmount; j++) {
                userFetchResult = await axios
                    .get(`${baseURL}/get-random-users/?limit=${usersAmount[i]}`);
                userFetchResultFromCache = await axios
                    .get(`${baseURL}/get-random-users-cache/?limit=${usersAmount[i]}`);
                
                elapsedTimeCache.push(userFetchResultFromCache.data.result.fetchTime);
                elapsedTimeDB.push(userFetchResult.data.result.fetchTime);
            }
        } catch (ex) {
            console.error(ex);
        }

        meanTimeCache.push(
            elapsedTimeCache.reduce((partialSum, el) => partialSum + el, 0) / retriesAmount
        );
        meanTimeDB.push(
            elapsedTimeDB.reduce((partialSum, el) => partialSum + el, 0) / retriesAmount
        );
    }

    console.log(usersAmount);
    console.log(meanTimeCache);
    console.log(meanTimeDB);
}

testGetRandomUsers(usersAmount, 500);