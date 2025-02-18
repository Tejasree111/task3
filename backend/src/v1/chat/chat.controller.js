const ChatService = require("./chat.service");

exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, group_id, message } = req.body;
    const chat = await ChatService.createMessage(sender_id, receiver_id, group_id, message);
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { user_id, group_id } = req.query;
    const messages = await ChatService.getMessages(user_id, group_id);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
