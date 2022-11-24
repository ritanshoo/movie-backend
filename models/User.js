const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    name : {type : String , required : true},
    email : {type : String , required : true , unique : true},
    password : {type : String , required : true},
    isAdmin : {type : Boolean },
    avatar : {type : String},
    created : {type : Date , default : Date.now}
});
 const User = mongoose.model('user',UserSchema );
 module.exports = User;
