import mongoose, { Schema } from "mongoose";
import {
  LISTING_CATEGORIES,
  LISTING_STATUSES,
  LISTING_PRICE_FREQUENCIES,
  LISTING_APPROVAL_STATUSES,
} from "@/constants/listing";

const MediaSchema = new Schema(
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

const ListingSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: LISTING_CATEGORIES,
      required: true,
      index: true,
    },
    price: { type: Number, required: true },
    priceFrequency: {
      type: String,
      enum: LISTING_PRICE_FREQUENCIES,
      default: "one-time",
    },
    location: {
      address: String,
      city: String,
      state: { type: String, default: "Oyo" },
    },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    landSize: { type: String },
    amenities: [String],
    media: [MediaSchema],
    status: {
      type: String,
      enum: LISTING_STATUSES,
      default: "available",
      index: true,
    },
    // Moderation gate, orthogonal to `status` (sale-state) -- an agent-created
    // listing starts "pending" and stays off the public storefront until a
    // manager/superadmin approves it; staff-created listings publish immediately.
    approvalStatus: {
      type: String,
      enum: LISTING_APPROVAL_STATUSES,
      default: "approved",
      index: true,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ListingSchema.index({ category: 1, status: 1, createdAt: -1 });

const Listing = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
export default Listing;
