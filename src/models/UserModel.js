const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, trim: true, unique: true },
    hashedPassword: { type: String, required: true },
    profilePicture: { type: String },
    isAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
