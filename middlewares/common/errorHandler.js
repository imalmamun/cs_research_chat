const createError = require("http-errors");

// when no route found
exports.notFoundHandler = (req, res, next) => {
  next(createError(404, "Your requested content is not found"));
};

// takes all error and handler lastly
exports.allErrorHandleLastly = (err, req, res, next) => {
  res.locals.error =
    process.env.NODE_ENV === "development" ? err : { message: err.message };
  res.status(err.status || 500);
  if (res.locals.html) {
    // html response
    res.render("error", {
      title: "Error Page",
    });
  } else {
    // json response
    res.json(res.locals.error);
  }
};
