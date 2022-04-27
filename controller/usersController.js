const User = require("../models/People");
const bcrypt = require("bcrypt");
const path = require("path");
const { unlink } = require("fs");

// create users page
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.render("users", {
      users: users,
    });
  } catch (err) {
    next(err);
  }
};

//  add user
exports.addUser = async (req, res, next) => {
  // console.log("add user hitted");

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  let newUser;
  if (req.files && req.files.length > 0) {
    newUser = new User({
      ...req.body,
      avatar: req.files[0].filename,
      password: hashedPassword,
    });
  } else {
    newUser = new User({
      ...req.body,
      password: hashedPassword,
    });
  }
  try {
    await newUser.save();
    res.status(200).json({
      message: "User was added successfully!",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "data couldn't save to the database",
        },
      },
    });
  }
};

// deleting user
exports.removeUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete({
      _id: req.params.id,
    });

    // removing the image if any
    if (user.avatar) {
      unlink(
        path.join(__dirname, `/../public/uploads/avatars/${user.avatar}`),
        (err) => console.log(err)
      );
    }

    res.status(200).json({
      message: "User is removed successfully!",
    })
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Could not delete the user!",
        },
      },
    })
  }
};
