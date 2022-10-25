const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
  allUsers,
} = require("../services/ChatServices");

const chatRouter = express.Router();

chatRouter.post("/", accessChat);
chatRouter.get("/", fetchChats);
chatRouter.get("/search", allUsers);
chatRouter.post("/group", createGroupChat);
chatRouter.put("/rename", renameGroup);
chatRouter.put("/groupremove", removeFromGroup);
chatRouter.put("/groupadd", addToGroup);

module.exports = chatRouter;
