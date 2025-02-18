const knex = require("../../../../backend/src/mysql/knexfile");

exports.createMessage = async (sender_id, receiver_id, group_id, message) => {
  return knex("chats").insert({ sender_id, receiver_id, group_id, message });
};

exports.getMessages = async (user_id, group_id) => {
  if (group_id) {
    return knex("chats").where("group_id", group_id).orderBy("created_at", "asc");
  } else {
    return knex("chats")
      .where(function () {
        this.where("sender_id", user_id).orWhere("receiver_id", user_id);
      })
      .orderBy("created_at", "asc");
  }
};
