const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRouter");
require("dotenv").config();
const UserModel = require("./models/UserModel");
const jwt = require("jsonwebtoken");
const chatRouter = require("./routes/chatRouter");
const messageRouter = require("./routes/messageRouter");

const port = process.env.PORT || 80;

const app = express();

mongoose
  .connect(process.env.REACT_APP_MONGODB_CONNECTION_STRING)
  .then(() => console.log("connected to Mongo DB successfully"))
  .catch((error) => console.log("Unable to connect to Mongo. Error: ", error));

//setup cors policy specified for cookies and server origin
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(cookieParser());

//body-parser for parsing JSON bodies
app.use(bodyParser.json());

app.use("/api/user", userRouter);

//Authorization Middleware
app.use(async (req, res, next) => {
  try {
    const { session_token: sessionToken } = req.cookies;

    if (!sessionToken) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    //this returns the jwt data or throws an eror
    const { userId, iat } = jwt.verify(
      sessionToken,
      process.env.REACT_APP_AUTH_SECRET_KEY
    );

    //if token is older than 30 days we reject it.
    if (iat < Date.now() - 30 * 24 * 60 * 60 * 1000) {
      return res.status(401).json({ message: "Token has expired" });
    }

    //find the user in the DB
    const foundUser = await UserModel.findOne({ _id: userId });

    if (!foundUser) {
      return next();
    }
    //after finding the user in the token we add the user to every request object
    req.user = foundUser;

    return next();
  } catch (error) {
    next(error);
  }
});

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    console.log("----> Error Hanlder: ", error);
  } else {
    res.status(500).json({
      message: "Sorry something went wrong...",
    });
    console.log("----> Error Hanlder: ", error);
  }
};

app.use("/api/chat", chatRouter);

app.use("/api/message", messageRouter);

app.use(errorHandler);

const server = app.listen(port, () =>
  console.log("Meow messenger server is listening for requests...")
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userId) => {
    socket.join(userId);
    socket.emit("connected");
  });

  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    console.log("user joined room: " + roomId);
  });

  socket.on("new message", (newMesssageRecieved) => {
    var chat = newMesssageRecieved.chat;
    if (!chat.users) {
      return console.log("chat.users not defined");
    }

    chat.users.forEach((user) => {
      if (user._id === newMesssageRecieved.sender._id) {
        return;
      }

      socket.in(user._id).emit("message recieved", newMesssageRecieved);
    });
  });

  socket.on("typing", (roomId) => socket.in(roomId).emit("typing", roomId));
  socket.on("stop typing", (roomId) => socket.in(roomId).emit("stop typing"));

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userId);
  });
});
