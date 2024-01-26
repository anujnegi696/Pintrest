const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");


mongoose.connect("mongodb://127.0.0.1:27017/pintrestDB");



const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref : 'Post'
  }],
   
  dp: {
    type: String
  }, 

  email: {
    type: String,
    required: true,
    unique: true
  },

  fullname:{
    type:String,
    required:true,
  },
  bio: {
    type: String,
    default: null
  }
 
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);


