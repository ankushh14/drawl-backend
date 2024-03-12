import userModel from "../models/user.model.js";
import { verifyToken } from "./auth.token.js";



const validateUser = async(req,res,next)=>{
    try{
    const authorization = req.headers.authorization
    if(!authorization){
        return res.status(404).json({message:"Invalid token",valid:false});
    }
    const token = authorization.split('Bearer ')[1]
    if(!token){
        return res.status(404).json({message:"Invalid token",valid:false});
    }
    const decodedToken = await verifyToken(token,process.env.ACCESS_TOKEN_SECRET)
    const {userId} = decodedToken
    if(!userId){
        return res.status(404).json({message:"Invalid token",valid:false});
    }
    const user = await userModel.findById(userId);
    if(!user){
        return res.status(401).json({message:"User does not exist",valid:false});
    }

    return next();

    }catch(err){
        return res.status(404).json({message:err.message,valid:false});
    }
}

export {validateUser}