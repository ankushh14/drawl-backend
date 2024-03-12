import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname : {type:String,required:true},
    email : {type:String,required:true,unique:true},
    password : {type:String,required:true,minLength:8},
    profile : {type:String,required:false,default:"https://wallpapers.com/images/high/default-profile-picture-finding-the-unfound-tyhvtmi1l0p3wueq.webp"},
    token : {type:String,required:false,unique:false,default:""},
},{
    timestamps : true
}
)

const userModel = mongoose.model("users",userSchema);

export default userModel