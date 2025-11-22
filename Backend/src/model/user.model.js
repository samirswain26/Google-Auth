import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    index: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  userId: {
    type: String,
    unique: true,
  },
  avatar: {
    type: String,
    default: "",
  },
});

const User = mongoose.model("User", userSchema);

export default User;
