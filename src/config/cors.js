require("dotenv").config();

const configCORS = (app) => {
  app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", process.env.REACT_URL);

    // Request methods bạn muốn cho phép
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    // Request tiêu đề bạn muốn cho phép
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type, Authorization",
      "UserID",
      "UserName"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
};

export default configCORS;
