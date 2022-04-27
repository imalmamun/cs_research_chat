// external imports
const express = require("express");
const { check } = require("express-validator");

// internal imports
const {
  getInbox,
  searchUser,
  addConversation,
  getMessages,
  sendMessage,
} = require("../controller/inboxController");
const { checkLogin } = require("../middlewares/common/checkLogin");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const attachmentUpload = require("../middlewares/inbox/attachmentUpload");

const router = express.Router();

// login routes
router.route("/").get(decorateHtmlResponse("Inbox"), checkLogin, getInbox);
// search user in user modal
router.route("/search").post(checkLogin, searchUser);
// add conversation
router.route("/conversation").post(checkLogin, addConversation);
// get all messages
router.route("/messages/:conversation_id").get(checkLogin, getMessages);
// send message
router.route("/message").post(checkLogin, attachmentUpload, sendMessage);

module.exports = router;
