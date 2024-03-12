import { Router } from "express";
import chatModel from "../models/chat.model.js";
import { validateUser } from "../middlewares/user.validate.js";



const chatRouter = Router()

chatRouter.post("/getchats", validateUser,async (req, res) => {
    try {
        const { ID } = req.body
        const chats = await chatModel.find({ roomID: ID })
        const dataToSend = await Promise.all(chats?.map((item) => {
            return {
                message: item.message,
                email: item.email,
                profile: item.profile,
                time : item.time
            }
        }))
        return res.status(200).json({ data: dataToSend, valid: true })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", valid: false })
    }
})

export default chatRouter