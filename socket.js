import chatModel from "./models/chat.model.js";
import * as SocketIO from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";
let onlineUsers = new Set();

export default function socketProvider(server) {

  const URL = process.env.SERVER_URL

  const io = new SocketIO.Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: URL,
    },
  });

  const nsp = io.of("/api/chatinterface/chats/");

  nsp.on("connection", (socket) => {
    if (socket.handshake.query.workspaceID !== null) {
      const workspaceID = socket.handshake.query.workspaceID;
      socket.join(workspaceID);
      onlineUsers.add(socket.handshake.query.email);
      nsp.to(workspaceID).emit("getOnline", Array.from(onlineUsers));

      socket.on("sendMessage", async (obj) => {
        await new chatModel({ ...obj, roomID: obj.id }).save();
        nsp.to(workspaceID).emit("message", obj);
      });

      socket.on("disconnect", () => {
        socket.leave(workspaceID);
        onlineUsers.delete(socket.handshake.query.email);
        nsp.to(workspaceID).emit("getOnline", Array.from(onlineUsers));
      });
    } else {
      return;
    }
  });

  const ysocketio = new YSocketIO(io);
  ysocketio.initialize();

  ysocketio.on("all-document-connections-closed", async (doc)=>{
    doc.awareness.states.clear()
  }
  );
}
