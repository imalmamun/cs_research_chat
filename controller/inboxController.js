// external imports
const createError = require("http-errors");
// internal imports
const escape = require("../utilities/escape");
const User = require("../models/People");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
// create inbox page
exports.getInbox = async (req, res, next) => {
  // console.log('inbox hitted....mamun bro');
  try {
    const conversations = await Conversation.find({
      $or: [
        { "creator.id": req.user.userId },
        {
          "participant.id": req.user.userId,
        },
      ],
    });
    res.locals.data = conversations;

    res.render("inbox");
  } catch (err) {
    next(err);
  }
};

// search user in conversation modal
exports.searchUser = async (req, res, next) => {
  const user = req.body.user;
  // console.log(JSON.stringify(user));
  const searchQuery = user.replace("+88", "");
  const name_search_regex = new RegExp(escape(searchQuery), "i");
  // console.log(JSON.stringify(name_search_regex));
  const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
  const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");

  try {
    if (searchQuery !== "") {
      const users = await User.find(
        {
          $or: [
            {
              name: name_search_regex,
            },
            {
              mobile: mobile_search_regex,
            },
            {
              email: email_search_regex,
            },
          ],
        },
        "name avatar"
      );

      res.json(users);
    } else {
      throw createError("You must provide some text to search!");
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
};

// creating conversation
exports.addConversation = async (req, res, next) => {
  try {
    const newConversation = new Conversation({
      creator: {
        id: req.user.userId,
        name: req.user.username,
        avatar: req.user.avatar,
      },
      participant: {
        id: req.body.id,
        name: req.body.participant,
        avatar: req.body.avatar,
      },
    });

    const result = await newConversation.save();
    res.status(200).json({
      message: "Conversation is added successfully!",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
};

// get all messages of a conversation
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversation_id: req.params.conversation_id,
    }).sort("-createdAt");

    const { participant } = await Conversation.findById(
      req.params.conversation_id
    );
    res.status(200).json({
      data: {
        messages: messages,
        participant,
      },
      userId: req.user.id,
      conversation_id: req.params.conversation_id,
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknown error occured!",
        },
      },
    });
  }
};

// send message
exports.sendMessage = async (req, res, next) => {
  // console.log("send message in inboxcontroller is hitted");
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      // console.log("try block is hitted");
      // save message text/attachment in database
      let attachments = null;
      if (req.files && req.files.length > 0) {
        attachments = [];
      }

      req.files.forEach((file) => {
        attachments.push(file.filename);
      });

      const newMessage = new Message({
        text: req.body.message,
        attachment: attachments,
        sender: {
          id: req.user.userId,
          name: req.user.username,
          avatar: req.user.avatar || null,
        },
        receiver: {
          id: req.body.receiverId,
          name: req.body.receiverName,
          avatar: req.body.avatar,
        },
        conversation_id: req.body.conversationId,
      });
      const result = await newMessage.save();
      // console.log("message is saved");

      //  emit socket event
      global.io.emit("new_message", {
        message: {
          conversation_id: req.body.conversationId,
          sender: {
            id: req.user.userId,
            name: req.user.username,
            avatar: req.user.avatar || null,
          },
          message: req.body.message,
          attachment: attachments,
          date_time: result.date_time,
        },
      });
      res.status(200).json({
        message: "Successfull!",
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            msg: err.message,
          },
        },
      });
    }
  }
};
