import mongoose,{ Schema } from "mongoose";

const workSpaceSchema = new Schema({
    name : {type:String,required:true,unique:false},
    description : {type:Schema.Types.String,required:true},
    password : {type:Schema.Types.String,required:false},
    members : {type:Schema.Types.Array,required:true,default:[]},
    owner : {type:Schema.Types.String,required:true,ref:"users"}
})

const workSpaceModel = mongoose.model("workspaces",workSpaceSchema)

export default workSpaceModel