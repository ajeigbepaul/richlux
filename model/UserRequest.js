import mongoose, { Schema } from "mongoose";
const userRequestSchema = new Schema(
  {
    fullname: String,
    email: String,
    phonenumber: String,
    request: String,
    presentlocation: String,
    sex: String,
    type: String,
    bed: String,
    budget: String,
    intendinglocation: String,
  },
  {
    timestamps: true,
  }
);

const UserRequest =
  mongoose.models.UserRequests ||
  mongoose.model("UserRequests", userRequestSchema);
export default UserRequest;
