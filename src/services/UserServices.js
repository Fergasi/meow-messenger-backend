const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const permissionServices = require("./PermissionServices");

//function to clean/standardize user data before returning to frontend
const cleanUser = (userDocument) => {
  return {
    id: userDocument._id,
    name: userDocument.name,
    email: userDocument.email,
    profilePicture: userDocument.profilePicture,
    isAdmin: userDocument.isAdmin,
  };
};

const getToken = (userId) => {
  //create user token
  return jwt.sign(
    { userId, iat: Date.now() },
    process.env.REACT_APP_AUTH_SECRET_KEY
  );
};

const signOut = (req, res, next) => {
  res.clearCookie("session_token");
  res.send("Signed out successfully");
};

const registerUser = async (req, res, next) => {
  //grab data from the request body
  const { name, email, password, profilePicture } = req.body;

  //hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userDocument = new UserModel({
      name,
      email,
      hashedPassword,
      profilePicture,
    });

    await userDocument.save();

    const token = getToken(userDocument._id);

    res.cookie("session_token", token, { httpOnly: true, secure: false }); //httpOnly: true - doesn't allow javascript code to access the cookie on the frontend // secure: false - should be true when https implemented and released to prod

    res.send({
      user: cleanUser(userDocument),
    });
  } catch (error) {
    //Express built-in error handling, see app.js middleware for custom errorHandling details
    next(error);
  }
};

const signIn = async (req, res, next) => {
  //get credential from the request
  const { email, password } = req.body.credentials;
  try {
    //check if user exists in DB
    const foundUser = await UserModel.findOne({ email: email });

    if (!foundUser) {
      return res
        .status(401)
        .json({ message: "User not found or incorrect credentials" });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      foundUser.hashedPassword
    );

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "User not found or incorrect credentials" });
    }

    const token = getToken(foundUser._id);
    //create session cookie
    res.cookie("session_token", token, { httpOnly: true, secure: false }); //httpOnly: true - doesn't allow javascript code to access the cookie on the frontend // secure: false - should be true when https implemented and released to prod

    res.send({
      user: cleanUser(foundUser),
    });
  } catch (error) {
    next(error);
  }
};

const userServices = { signIn, registerUser, signOut };

module.exports = userServices;
