const mongoose = require("mongoose");
const conversationSchema = mongoose.Schema(
  {
    creator: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: {
        public_id: String,
        url: String,
      },
    },
    participant: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: {
        public_id: String,
        url: String,
      },
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);
