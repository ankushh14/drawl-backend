import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    message: {type:mongoose.Schema.Types.String,required:true},
    email: {type:mongoose.Schema.Types.String,required:true},
    profile: {type:mongoose.Schema.Types.String,required:true},
    time : {type:mongoose.Schema.Types.String,required:true},
    roomID : {type:mongoose.Schema.Types.ObjectId,ref:"workspaces",required:true}
},
{
    timestamps:true
}
)

chatSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 86400 })


const chatModel = mongoose.model("chats",chatSchema)

export default chatModel