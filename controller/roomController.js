const { v4: uuidV4 } = require("uuid");

exports.getRoomLink = async (req, res, next) => {
    console.log("it's working fine");
  res.json({
    roomId: uuidV4(),
  });
};

exports.getRoom = async (req, res, next) => {
//   res.locals.title = "room page";
  res.render("room");
};
