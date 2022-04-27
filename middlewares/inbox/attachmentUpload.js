const uploader = require("../../utilities/multipleUploader");

function avatarUpload(req, res, next) {
  // console.log("hehehe")
  const upload = uploader(
    "attachments",
    ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
    1000000,
    2,
    "Only .jpg, jpeg or .png format allowed!"
  );

  // call the middleware function
  upload.any()(req, res, (err) => {
    // console.log("attachmentUpload is hitted");
    if (err) {
      res.status(500).json({
        errors: {
          avatar: {
            msg: err.message,
          },
        },
      });
    } else {
      // console.log('avater uploaded successfully- avatarUpload.js');

      next();
    }
  });
}

module.exports = avatarUpload;
