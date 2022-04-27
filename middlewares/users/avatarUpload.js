const uploader = require("../../utilities/singleUploader");

function avatarUpload(req, res, next) {
  // console.log("hehehe")
  const upload = uploader(
    "avatars",
    ["image/jpeg", "image/jpg", "image/png"],
    1000000,
    "Only .jpg, jpeg or .png format allowed!"
  );

  // call the middleware function
  upload.any()(req, res, (err) => {
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