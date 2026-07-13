const mongoose = require("mongoose");

const ROLES = ["superadmin", "manager", "agent", "user"];

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: [true, "Email already exist!"],
      required: [true, "Email is required!"],
    },
    username: {
      type: String,
      required: [true, "Username already exist"],
    },
    image: {
      type: String,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.user || mongoose.model("user", UserSchema);
module.exports = { User, ROLES };
