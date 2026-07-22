import mongoose, { Schema } from "mongoose";

// Homepage Hero carousel slides -- admin-managed, image or video. `order`
// drives display sequence (lower first); `isActive` lets staff stage a
// banner without it going live immediately, or retire one without deleting
// the Cloudinary asset.
const BannerSchema = new Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    publicId: { type: String, required: true },
    secureUrl: { type: String, required: true },
    width: Number,
    height: Number,
    duration: Number,
    title: { type: String, trim: true },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BannerSchema.index({ isActive: 1, order: 1 });

const Banner = mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
export default Banner;
