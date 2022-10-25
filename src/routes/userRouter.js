const express = require("express");
const { signOut, registerUser, signIn } = require("../services/UserServices");

const userRouter = express.Router();

userRouter.post("/sign-in", signIn);

userRouter.get("/sign-out", signOut);

userRouter.post("/register-user", registerUser);

module.exports = userRouter;
