const bcrypt = require("bcrypt");
const User = require("../models/People");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
// create login page
exports.getLogin = (req, res, next) => {
  // res.locals.
  res.render("index", {
    data: {
      username: '',
    },
    errors: {
      common: {
        msg: '',
      },
    },
  });
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }],
    });
    // checking user really exist then we will check the password right or not
    if (user) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      // as we don't have register option we have to create json web token while user login to the webiste.

      // if user password is right then we will create a object for creating json web token
      if (isValidPassword) {
        // preparing the user object for generating token
        const userObject = {
          userId: user._id,
          username: user.name,
          email: user.email,
          avatar: user.avatar || null,
          role: user.role || "user",
        };

        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });

        res.cookie("token", token, {
          maxAge: process.env.JWT_EXPIRE,
          httpOnly: true,
          signed: true,
        });
        // sending user details to the inbox page so that it can indentify the user is logged in user...and set logout button
        // res.locals.loggedInUser = userObject;
        res.redirect("inbox");
      } else {
        throw createError(
          "Login failed! Maybe Password Incorrect. Please try again."
        );
      }
    } else {
      throw createError("Login failed! Please try again.");
    }
  } catch (err) {
    res.render("index", {
      data: {
        username: req.body.username,
      },
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
};

// logging out user
exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  res.locals.loggedInUser = undefined;
  res.render("index");
};
