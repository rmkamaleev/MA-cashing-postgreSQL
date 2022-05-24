const delay = (x) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(x + "secs");
      }, x * 1000);
    });
};

module.exports = {
    delay
}