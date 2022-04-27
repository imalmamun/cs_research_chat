// external imports
const express = require("express");

// internal imports
const { getUsers, removeUser } = require("../controller/usersController");
const { addUser } = require("../controller/usersController");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const avatarUpload = require("../middlewares/users/avatarUpload");
const { check } = require("express-validator");
const {
  addUserValidator,
  addUserValidationHandler,
} = require("../middlewares/users/usersValidators");
const { checkLogin, requireRole } = require("../middlewares/common/checkLogin");

const router = express.Router();

// login routes (rendering user page --get, uploading new user details --post)
router
  .route("/")
  .get(
    decorateHtmlResponse("Users"),
    checkLogin,
    requireRole(["admin"]),
    getUsers
  )
  .post(
    checkLogin,
    requireRole(["admin"]),
    avatarUpload,
    addUserValidator,
    addUserValidationHandler,
    addUser
  )
  router.route("/:id").delete(checkLogin, requireRole(["admin"]), removeUser);

module.exports = router;
