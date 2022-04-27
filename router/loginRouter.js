// external imports
const express = require("express");

// internal imports
const {
  getLogin,
  login,
  logoutUser,
} = require("../controller/loginController");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const {
  doLoginValidator,
  doLoginValidatorErrorHandler,
} = require("../middlewares/login/loginValidators");
const { redirectLogin } = require("../middlewares/common/checkLogin");

const router = express.Router();

// login routes
// console.log('heated...');

router
  .route("/")
  .get(decorateHtmlResponse("Login"), redirectLogin, getLogin)
  .post(
    decorateHtmlResponse("Index"),
    doLoginValidator,
    doLoginValidatorErrorHandler,
    login
  )
  .delete(logoutUser);

module.exports = router;
