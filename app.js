// external imports
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const moment = require("moment");
const http = require("http");
const io = require("socket.io");
const cors = require("cors");

// const ejsLint = require("ejs-lint");

// internal imports
const {
  notFoundHandler,
  allErrorHandleLastly,
} = require("./middlewares/common/errorHandler");

const app = express();
const server = http.createServer(app);
dotenv.config();

// configuring cors
// app.use(
//   cors({
//     origin: "*",
//   })
// );

// socket creation
global.io = io(server);

// set moment as app locals
app.locals.moment = moment;

// database connection
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database connection successful"))
  .catch((err) => {
    console.log("database connection error");
    console.log(err);
  });

// request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set view engine
app.set("view engine", "ejs");

// set static folder
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static("public"))

// cookie-parser
app.use(cookieParser(process.env.COOKIE_SECRET));

// routing setup
const loginRouter = require("./router/loginRouter");
const usersRouter = require("./router/usersRouter");
const inboxRouter = require("./router/inboxRouter");

app.use("/", loginRouter);
app.use("/users", usersRouter);
app.use("/inbox", inboxRouter);

// not found page
app.use(notFoundHandler);

// error handling
app.use(allErrorHandleLastly);

// server listening
server.listen(process.env.PORT, () => {
  console.log(`server is listening on port: ${process.env.PORT}`);
});
