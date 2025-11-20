const whiteList = ["http://localhost:3000","https://invoice-fe-vlyg.vercel.app","https://invoice-fe-phi.vercel.app/"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin ||whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Access denied by CORS"));
    }
  },
  optionsSuccessStuatus: 200,
};

module.exports = corsOptions;


