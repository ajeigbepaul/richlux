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
    budget: Number,
    intendinglocation: String,
    listingId: { type: Schema.Types.ObjectId, ref: "Listing" },
    status: {
      type: String,
      enum: ["open", "contacted", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

const UserRequest =
  mongoose.models.UserRequests ||
  mongoose.model("UserRequests", userRequestSchema);
export default UserRequest;
