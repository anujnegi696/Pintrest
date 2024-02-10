const multer = require('multer');
const {v4 : uuidv4} = require('uuid');
const path = require("path");

//const storage = multer.diskStorage({
// destination: function(req,res,cb){
//     cb(null,'./public/images/uploads')
// },
// filename: function(req,file,cb){
//     const uniquename = uuidv4();
//     cb(null,uniquename+path.extname(file.originalname));
// }
// });
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
      // Set a default filename if no file is uploaded
      const defaultFilename = 'default-profile-picture.png';
      // If file is uploaded, use original filename
      const filename = file ? file.originalname : defaultFilename;
      cb(null, filename);
    }
  });


const upload = multer({storage: storage});

module.exports = upload;