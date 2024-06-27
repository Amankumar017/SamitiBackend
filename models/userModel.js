const mongoose = require('mongoose');

//create schema
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        default:'/Images/defaultImage.png',
    },
    about:{
        type:String,
        default: 'Reading books',
    },
    role: {
        type: String,
        default: 'user',
    },
}, { timestamps: true});


//create model
const User = mongoose.model('User',userSchema);
module.exports = User;