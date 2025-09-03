import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,

    },
    username:{
        type:String,
        required:true,
        unique:true,

    },
    email:{
        type:String,
        required:true,
        unique:true,
        
    },
    active:{
        type:Boolean,
        default:true
    },
    password:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default:"https://res.cloudinary.com/dhezjyeqh/image/upload/v1756891973/icon-7797704_1280_vynrdy.png"
    },
    createdAt:{
        type:Date,
        default:Date.now
        
    },
    token:{
        type:String,
        default:''
    },
})

const User = mongoose.model("User",UserSchema)
export default User;