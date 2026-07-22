import mongoose, { Schema } from "mongoose";
import { LISTING_PRICE_FREQUENCIES } from "@/constants/listing";
import { OFFER_STATUSES } from "@/constants/request";

// Deliberately duplicated from Listing.js's MediaSchema rather than a shared
// import -- both are tiny, subdocument-only (_id: false), and decoupling
// avoids Offer breaking if Listing's media shape ever changes for
// listing-specific reasons.
const OfferMediaSchema = new Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    publicId: { type: String, required: true },
    secureUrl: { type: String, required: true },
    width: Number,
    height: Number,
    duration: Number,
    isCover: { type: Boolean, default: false },
  },
  { _id: false }
);

const OfferSchema = new Schema(
  {
    request: { type: Schema.Types.ObjectId, ref: "UserRequests", required: true, index: true },
    agent: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
    listing: { type: Schema.Types.ObjectId, ref: "Listing" },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    priceFrequency: { type: String, enum: LISTING_PRICE_FREQUENCIES, default: "one-time" },
    location: {
      address: String,
      // Holds the LGA (naming kept from before the Area level was added).
      city: String,
      state: { type: String, default: "Oyo" },
      area: String,
    },
    bedrooms: Number,
    bathrooms: Number,
    media: [OfferMediaSchema],

    status: { type: String, enum: OFFER_STATUSES, default: "pending", index: true },
  },
  { timestamps: true }
);

// One offer per agent/manager per request.
OfferSchema.index({ request: 1, agent: 1 }, { unique: true });

const Offer = mongoose.models.Offer || mongoose.model("Offer", OfferSchema);
export default Offer;
