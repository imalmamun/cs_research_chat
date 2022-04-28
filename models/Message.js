const mongoose = require("mongoose");
const messageSchema = mongoose.Schema(
  {
    text: String,
    attachments: [
      {
        public_id: String,
        url: String, 
      },
    ],
    sender: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: {
        public_id: String,
        url: String,
      },
    },
    receiver: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: {
        public_id: String,
        url: String,
      },
    },
    data_time: {
      type: Date,
      default: Date.now,
    },
    conversation_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
