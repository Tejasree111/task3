const ChatService = require("./chat.service");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("joinRoom", ({ group_id }) => {
      socket.join(group_id);
    });

    socket.on("sendMessage", async ({ sender_id, receiver_id, group_id, message }) => {
      const chat = await ChatService.createMessage(sender_id, receiver_id, group_id, message);
      io.to(group_id || receiver_id).emit("receiveMessage", chat);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
