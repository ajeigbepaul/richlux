import mongoose, { Schema } from "mongoose";
import { LISTING_CATEGORIES, LISTING_PRICE_FREQUENCIES } from "@/constants/listing";
import {
  MOVE_IN_TIMEFRAMES,
  USER_REQUEST_STATUSES,
  CONTACT_METHODS,
  CONTACT_TIMES,
  FURNISHING_OPTIONS,
} from "@/constants/request";

const userRequestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },

    // Contact & preferences
    fullname: String,
    email: String,
    phonenumber: String,
    preferredContactMethod: { type: String, enum: CONTACT_METHODS },
    preferredContactTime: { type: String, enum: CONTACT_TIMES },
    sex: { type: String, enum: ["male", "female"] },

    // What they're looking for
    category: { type: String, enum: LISTING_CATEGORIES, required: true, index: true },
    type: String,
    bedrooms: Number,
    bathrooms: Number,
    furnishing: { type: String, enum: FURNISHING_OPTIONS },
    parkingSpaces: Number,
    amenities: [String],
    householdSize: Number,

    // Budget & timing
    budgetMin: Number,
    budgetMax: Number,
    priceFrequency: { type: String, enum: LISTING_PRICE_FREQUENCIES },
    moveInTimeframe: { type: String, enum: MOVE_IN_TIMEFRAMES },
    // Shortlet-only
    checkInDate: Date,
    checkOutDate: Date,
    numberOfGuests: Number,
    // Rental-only
    leaseDurationPreference: String,

    // Location
    presentlocation: String,
    preferredLocations: [String],

    // Everything else
    request: String,
    listingId: { type: Schema.Types.ObjectId, ref: "Listing" },
    status: { type: String, enum: USER_REQUEST_STATUSES, default: "open", index: true },
    acceptedOffer: { type: Schema.Types.ObjectId, ref: "Offer" },
  },
  {
    timestamps: true,
  }
);

const UserRequest =
  mongoose.models.UserRequests ||
  mongoose.model("UserRequests", userRequestSchema);
export default UserRequest;
