const whiteList = [
  "http://localhost:3000",
  "https://invoice-fe-vlyg.vercel.app",
  "https://invoice-fe-phi.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    console.log("CORS origin:", origin);
    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Access denied by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;

