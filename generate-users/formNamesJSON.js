const fs = require("fs");

// Formig the first and last names data
const names = fs.readFileSync("names.txt", "utf-8");
const namesArray = names.split("\n");
const firstNames = namesArray.map((el) => el.split(",")[0]);
const lastNames = namesArray.map((el) => el.split(",")[1]);

const namesJSONData = {
    firstNames,
    lastNames
};

fs.writeFileSync("names.json", JSON.stringify(namesJSONData));