const multer = require("multer");
const path = require("path");
const fs = require("fs");

// const upload = multer({ dest: 'images/profile/' })
let loc = "";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    loc = path.join("public", "excel");
    fs.mkdir(loc, (err) => {});
    cb(null, loc);
  },

  filename: function (req, file, cb) {
    const myName = `${file.originalname}`;
    cb(null, myName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 20000000 },
  fileFilter: function (req, file, cb) {
    cb(null, true);
  },
});

module.exports = upload;
