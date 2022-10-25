const express = require("express");
const { allMessages, sendMessage } = require("../services/MessageServices");

const messageRouter = express.Router();

messageRouter.get("/:chatId", allMessages);
messageRouter.post("/", sendMessage);

module.exports = messageRouter;
