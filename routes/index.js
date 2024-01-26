var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const passport = require('passport');
const upload = require("./multer")

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));



router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/profile',isLoggedIn, async function(req, res, next) {
 const user = await userModel.findOne({
  username:req.session.passport.user
 })
 .populate("posts")
  res.render("profile",{user});
});

router.get('/editprofile',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username:req.session.passport.user
   })
   .populate("posts") 
  res.render("editprofile",{user});
 });
 

  router.get('/show/posts',isLoggedIn, async function(req, res, next) {
    const user = await userModel.findOne({
     username:req.session.passport.user
    })
    .populate("posts")
     res.render("show",{user});
   });
   

  router.get('/add',isLoggedIn, async function(req, res, next) {
    const user = await userModel.findOne({username: req.session.passport.user });
   res.render("add",{user});
    });
  

router.post('/fileupload',isLoggedIn, upload.single("image"),async function(req, res, next) {
  const user =  await userModel.findOne({username: req.session.passport.user})
  user.dp = req.file.filename;
   await user.save();
   res.redirect("/editprofile");
 });

 router.post('/updateprofile',isLoggedIn, upload.single("image"),async function(req, res, next) {
  const user =  await userModel.findOne({username: req.session.passport.user})
     // Only update bio if it's provided in the form data
     if (req.body.bio !== undefined) {
      user.bio = req.body.bio;
  }

  // Update fullname only if it's provided in the form data
  if (req.body.fullname !== undefined) {
      user.fullname = req.body.fullname;
  }
   await user.save();
   res.redirect("/editprofile");
 });
 router.post('/updateusername', isLoggedIn, upload.single("image"), async function(req, res, next) {
  try {
      const user = await userModel.findOne({ username: req.session.passport.user });

      if (!user) {
          return res.status(404).send('User not found');
      }

      const newUsername = req.body.username;

      // Check if the new username is provided and is different from the current one
      if (newUsername !== undefined && newUsername !== user.username) {
          // Check if the new username is unique
          const isUsernameUnique = await userModel.findOne({ username: newUsername });

          if (isUsernameUnique) {
              return res.status(400).send('Username is already taken. Please choose another.');
          }

          // Update the username
          user.username = newUsername;
          await user.save();
      }

      res.redirect('/editprofile');
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

 



router.get('/login', function(req, res) {
  res.render("login",{error:req.flash('error')});
 
});

router.get('/feed', isLoggedIn,async function(req, res) {
 const user = await userModel.findOne({username: req.session.passport.user}); 
 const posts = await postModel.find()
 .populate("user");
 res.render("feed",{user,posts,nav:true});
});

router.post('/upload',isLoggedIn,upload.single("file"), async function(req, res) {
 if (!req.file){
  return res.status(404).send("no files were given");
 }
const user =  await userModel.findOne({username: req.session.passport.user})
const post = await postModel.create({
  image: req.file.filename,
  imageText:req.body.filecaption,
  user: user._id
});
user.posts.push(post._id);
await user.save();
res.redirect('/profile');
});


router.post('/createpost',isLoggedIn,upload.single("file"), async function(req, res) {
  if (!req.file){
   return res.status(404).send("no files were given");
  }
 const user =  await userModel.findOne({username: req.session.passport.user})
 const post = await postModel.create({
   image: req.file.filename,
   imageText:req.body.filecaption,
   user: user._id
 });
 user.posts.push(post._id);
 await user.save();
 res.redirect('/profile');
 });
 



router.post("/register", function(req, res) {
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email,fullname });

  userModel.register(userData,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect('/profile');
    })
  })
  
});

router.post("/login",passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true 
}), function(req, res){
});

router.get("/logout",function(req,res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated())return next();
  res.redirect("/login");
}


module.exports = router;
