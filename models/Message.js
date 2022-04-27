const mongoose = require("mongoose");
const messageSchema = mongoose.Schema({
    text: String,
    attachment: [{
        type: String,
    },
    ],
    sender: {
        id: mongoose.Types.ObjectId,
        name: String,
        avatar: String,
    },
    receiver: {
        id: mongoose.Types.ObjectId,
        name: String,
        avatar: String,
    },
    data_time: {
        type: Date,
        default: Date.now,
    },
    conversation_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    }

},{
    timestamps: true,
})


module.exports = mongoose.model("Message", messageSchema);


