const { DateTime } = require("luxon");
const fs = require("fs");

const fileLog = (data, file) => {
    let str = `[${DateTime.local().toFormat("DD HH:mm:ss")}] `;
    str += data + "\n";
    if (!file) file = "logs.log";
    fs.writeFileSync(file, str, { flag: "a" });
}

const consoleLog = (data) => {
    let str = `[${DateTime.local().toFormat("DD HH:mm:ss")}] `;
    str += data;
    console.log(str);
}

module.exports = {
    fileLog,
    consoleLog
}