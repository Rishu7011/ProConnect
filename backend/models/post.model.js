import mongoose from "mongoose";


const PostSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,

    },
    body:{
        type:String,
        required:true

    },
    likes:{
        type:Number,
        default:0
        
    },
    createdAt:{
        type:Date,
        default:Date.now
        
    },
    updatedAt:{
        type:Date,
        
    },
    media:{
        type:String,
        default:'',
        
    },
    active:{
        type:Boolean,
        default:true
    },
    filetype:{
        type:String,
        default:'',
    },
})

const Post = mongoose.model("Post",PostSchema)
export default Post;