const express = require("express");
const router = express.Router();
const {getRoom, getRoomLink} = require("../controller/roomController");
const { checkLogin } = require("../middlewares/common/checkLogin");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
router.route("/generateroomlink").get(checkLogin, getRoomLink);
router.route("/:roomId").get(decorateHtmlResponse("Room"),checkLogin, getRoom);


module.exports = router;