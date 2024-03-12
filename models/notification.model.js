import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    email : {type:mongoose.Schema.Types.String,required:true,ref:"users"},
    message : {type:mongoose.Schema.Types.String,required:true},
    type : {type:mongoose.Schema.Types.String,required:true},
    from : {type:mongoose.Schema.Types.String,required:true,ref:"users"},
    workspaceID : {type:mongoose.Schema.Types.ObjectId,required:true,ref:"workspaces"}
})

const notificationModel = mongoose.model("notifications",notificationSchema)

export default notificationModel