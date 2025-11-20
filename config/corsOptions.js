const whiteList = ["http://localhost:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Access denied by CORS"));
    }
  },
  optionsSuccessStuatus: 200,
};

module.exports = corsOptions;
