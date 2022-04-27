const jwt = require("jsonwebtoken");
const createErrors = require("http-errors");

// auth guard to protect routes that need authentication
exports.checkLogin = (req, res, next) => {
  let cookies = req.signedCookies;
  //   Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;
  //   console.log(`cookies: ${cookies}`)
  if (cookies) {
    try {
      const { token } = cookies;
      const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decodedUser;
      // pass user info to response local
      // console.log(decodedUser);
      if (res.locals.html) {
        res.locals.loggedInUser = decodedUser;
        // console.log(`hi al mamun: ${res.locals.loggedInUser.username}`);
      }

      next();
    } catch (err) {
      if (res.locals.html) {
        res.redirect("/");
      } else {
        res.status(500).json({
          errors: {
            common: {
              msg: "Authentication failure!",
            },
          },
        });
      }
    }
  } else {
    if (res.locals.html) {
      res.redirect("/");
    } else {
      res.status(401).json({
        error: "Authetication failure!",
      });
    }
  }
};

exports.redirectLogin = (req, res, next) => {
  let cookies = req.signedCookies;
  //   Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;
  //   console.log(`cookies: ${cookies}`)
  if (cookies) {
    try {
      const { token } = cookies;
      const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decodedUser;
      // pass user info to response local
      // console.log(decodedUser);
      if (res.locals.html) {
        res.locals.loggedInUser = decodedUser;
        console.log(`hi al mamun: ${res.locals.loggedInUser.username}`);
      }

      res.redirect("/inbox");
    } catch (err) {
      res.locals.loggedInUser = undefined;
      next();
    }
  } else {
    res.locals.loggedInUser = undefined;
    next();
  }
};
//  guard to protect route that needs role based authorization
exports.requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role && role.includes(req.user.role)) {
      next();
    } else {
      res.locals.html = true;
      if (res.locals.html) {
        // res.render("error", {
        //   title: "Not Authorize",
        //   error: {
        //     message: "You are not authorized for this page!",
        //   },
        // });
        next(createErrors(401, "You are not authorized to access this page!"));
      } else {
        res.status(401).json({
          errors: {
            common: {
              msg: "You are not authorized!",
            },
          },
        });
      }
    }
  };
};
