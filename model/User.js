const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
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
});

const User = mongoose.models.user || mongoose.model("user", UserSchema);
module.exports = { User };
