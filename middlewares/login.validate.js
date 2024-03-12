import userModel from "../models/user.model.js"
import axios from "axios"

const googleTokenValidate = async(googleToken)=>{
        let userData = {};
        try {
            userData = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`);
        } catch (error) {
            throw new Error("Invalid Token")
        }
        const user = await userModel.findOne({email:userData.data.email});
        if(!user){
            throw new Error("User not found")
        }else{
            return user._id
        }
}

export {googleTokenValidate}