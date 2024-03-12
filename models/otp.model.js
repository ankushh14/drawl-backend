import mongoose, { Schema, model } from "mongoose";

const otpSchema = new Schema({
    password : {type:String,required:true,minLength:8},
    fullname : {type:String,required:false},
    profile : {type:String,required:false},
    email : {type:String,required:true,unique:true},
    OTP : {type:String,required:true,minLength:5},
},
{
    timestamps:true
}
)

otpSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 60 })

const otpModel = model("otp",otpSchema);

export default otpModel