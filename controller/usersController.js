const User = require("../models/People");
const bcrypt = require("bcrypt");
const path = require("path");
const { unlink } = require("fs");
const cloudinary = require("../utilities/cloudinary");

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

  // uploading image to cloudinary
  const result = await cloudinary.uploader.upload(
    req.files[0].path,
    {
      folder: "cs_research_chat/user_avatars",
      width: 100,
      height: 100,
      gravity: "faces",
      crop: "thumb",
      use_filename: true,
      unique_filename: false,
    },

    (err, result) => {
      if (err) {
        console.log(`cloudinary error: ${err}`);
      } else {
        console.log(`cloudinary success: ${result}`);
      }
    }
  );

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  let newUser;
  if (req.files && req.files.length > 0) {
    newUser = new User({
      ...req.body,
      password: hashedPassword,
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
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
    // if (user.avatar) {
    //   unlink(
    //     path.join(__dirname, `/../public/uploads/avatars/${user.avatar}`),
    //     (err) => console.log(err)
    //   );
    // }

    const imageId = user.avatar.public_id;

    await cloudinary.uploader.destroy(imageId);

    res.status(200).json({
      message: "User is removed successfully!",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Could not delete the user!",
        },
      },
    });
  }
};
