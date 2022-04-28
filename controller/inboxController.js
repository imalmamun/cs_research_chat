// external imports
const createError = require("http-errors");
// internal imports
const escape = require("../utilities/escape");
const User = require("../models/People");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const cloudinary = require("../utilities/cloudinary");
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
    // console.log(JSON.stringify(req.body.avatar.url));

    const newConversation = new Conversation({
      creator: {
        id: req.user.userId,
        name: req.user.username,
        avatar: {
          public_id: req.user.avatar.public_id,
          url: req.user.avatar.url,
        },
      },
      participant: {
        id: req.body.id,
        name: req.body.participant,
        avatar: {
          public_id: req.body.public_id,
          url: req.body.url,
        },
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

// deleting conversation
exports.deleteConversation = async (req, res, next) => {
  try {
    console.log("mamun id:" + req.params.conversation_id);
    const messages = await Message.find({
      conversation_id: req.params.conversation_id,
    });

    // if (messages) {
    //   console.log("inside loop1*: " + messages.length);
    // }

    for (let i = 0; i < messages.length; i++) {
      // console.log("inside loop1: entering1");
      // console.log(JSON.stringify(messages[i].attachments));
      let length = messages[i].attachments;
      if (length) {
        // console.log("inside loop2:"+ messages[i].attachments.length);
        for (let j = 0; j < messages[i].attachments.length; j++) {
          // console.log("inside loop: " + messages[i].attachments[j].public_id);

          let imageId = messages[i].attachments[j].public_id;
          await cloudinary.uploader.destroy(imageId);
          // console.log("i= " + i + "j= " + j);
        }
      }
    }
    const status = await Message.deleteMany({
      conversation_id: req.params.conversation_id,
    });

    // conversation delete option will be included here...next i will create a drop down menu and there will be two option: 1. delete just messages 2. delete the conversation and messages

    const conversation = await Conversation.findByIdAndDelete({
      _id: req.params.conversation_id,
    });
    res.json({
      conversation,
    });
  } catch (err) {}
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
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      let attachments = null;

      if (req.files && req.files.length > 0) {
        attachments = [];
        for (let i = 0; i < req.files.length; i++) {
          const result = await cloudinary.uploader.upload(req.files[i].path, {
            folder: "cs_research_chat/message_res",
          });

          attachments.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }
      }

      const newMessage = new Message({
        text: req.body.message,
        attachments: attachments,
        sender: {
          id: req.user.userId,
          name: req.user.username,
          avatar: {
            public_id: req.user.avatar.public_id || null,
            url: req.user.avatar.url,
          },
        },
        receiver: {
          id: req.body.receiverId,
          name: req.body.receiverName,
          avatar: {
            public_id: req.user.avatar.public_id || null,
            url: req.user.avatar.url,
          },
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
          attachments: attachments,
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
