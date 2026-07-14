const mongoose = require("mongoose");

const ROLES = ["superadmin", "manager", "agent", "user"];
const AGENT_APPLICATION_STATUSES = ["none", "pending", "approved", "rejected"];

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: [true, "Email already exist!"],
      required: [true, "Email is required!"],
      lowercase: true,
      trim: true,
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
    agentApplication: {
      status: { type: String, enum: AGENT_APPLICATION_STATUSES, default: "none" },
      message: { type: String },
      appliedAt: { type: Date },
    },
  },
  { timestamps: true }
);

const User = mongoose.models.user || mongoose.model("user", UserSchema);
module.exports = { User, ROLES, AGENT_APPLICATION_STATUSES };
