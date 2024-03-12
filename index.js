import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import mongoose from "mongoose";
import authRouter from "./routes/auth.router.js";
import cookieParser from "cookie-parser";
import workspaceRouter from "./routes/workspace.router.js";
import notificationRouter from "./routes/notification.router.js";
import chatRouter from "./routes/chat.router.js";
import path from "path";
import socketProvider from "./socket.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT;
const Mongo_url = process.env.MONGO_URL;
const cookieSecret = process.env.COOKIE_SECRET;
const URL = process.env.SERVER_URL

app.use(express.json());
app.use(cookieParser(cookieSecret))
app.use(cors({
    credentials: true,
    origin:[URL],
    exposedHeaders: ["Set-Cookie"],
    allowedHeaders: ['X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept,Authorization'],
    optionsSuccessStatus: 200,
    methods:['GET','PUT','POST','DELETE'],
}
));
app.use("/api/auth",authRouter);
app.use("/api/workspace",workspaceRouter)
app.use("/api/notifications",notificationRouter)
app.use("/api/chats",chatRouter)

const dist = path.resolve(process.cwd() , "dist")
app.use(express.static(dist));

app.get('*', (req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
});

var server = null

mongoose.connect(Mongo_url).then(()=>{
    server = app.listen(PORT)
    socketProvider(server)
})