/**
 * One-off dev seed: creates ~20 sample Listing documents with real photos
 * (hotlinked from Pexels/Unsplash, then re-uploaded to Cloudinary so each
 * gets a proper publicId like every other listing image -- CldImage can't
 * render a bare external URL) so the listings filter panel
 * (app/listings/page.js) has real data across every filterable field
 * (category, price, bedrooms, bathrooms, state/LGA, sort) to exercise.
 *
 * Requires an existing agent/manager/superadmin user to own the listings --
 * run `node scripts/promoteSuperAdmin.js <email>` first if none exist yet.
 *
 * Usage: node --env-file=.env.local scripts/seedListings.js
 * (dotenv isn't an actual dependency here despite the other scripts'
 * comments -- Node's native --env-file flag is what actually loads .env.local)
 */
const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const NaijaStates = require("naija-state-local-government");
const { User } = require("../model/User");

// Mirrors model/Listing.js's schema exactly -- duplicated rather than
// required directly because that file (and constants/listing.js) use ESM
// `import`/`export`, which a plain CommonJS script run outside Next's
// bundler can't require() (and Listing.js's own `@/constants/listing`
// import has no meaning outside Next's webpack alias resolution either).
const MediaSchema = new mongoose.Schema(
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

const ListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    priceFrequency: { type: String, default: "one-time" },
    location: {
      address: String,
      city: String,
      state: { type: String, default: "Oyo" },
    },
    bedrooms: Number,
    bathrooms: Number,
    landSize: String,
    amenities: [String],
    media: [MediaSchema],
    status: { type: String, default: "available", index: true },
    approvalStatus: { type: String, default: "approved", index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);
ListingSchema.index({ category: 1, status: 1, createdAt: -1 });

// Reuses the real npm package model/utils/nigeriaLocations.js is built on,
// so seeded LGA names line up exactly with what the State/LGA filter select
// actually offers.
const LAGOS_LGAS = NaijaStates.lgas("Lagos").lgas;
const OYO_LGAS = NaijaStates.lgas("Oyo").lgas;

// Verified working (HTTP 200/206, image/*) against the live Pexels/Unsplash
// CDNs before use -- hotlinking a known photo's stable CDN URL needs no API
// key, unlike their search APIs.
const IMAGE_URLS = [
  "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
  "https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg",
  "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
  "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg",
  "https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg",
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
  "https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg",
  "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
  "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg",
  "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg",
  "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg",
  "https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg",
  "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg",
  "https://images.pexels.com/photos/302769/pexels-photo-302769.jpeg",
  "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg",
  "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg",
  "https://images.pexels.com/photos/1571452/pexels-photo-1571452.jpeg",
  "https://images.pexels.com/photos/447592/pexels-photo-447592.jpeg",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  "https://images.unsplash.com/photo-1591474200742-8e512e6f98f8",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd",
  "https://images.unsplash.com/photo-1494526585095-c41746248156",
];

const AMENITIES_POOL = [
  "24/7 Security",
  "Parking Space",
  "Backup Generator",
  "Swimming Pool",
  "Gym",
  "Water Treatment",
  "CCTV",
  "Fitted Kitchen",
  "Air Conditioning",
  "Gated Estate",
];

function pick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// One blueprint per listing -- title/description/price/bed/bath ranges are
// hand-picked per category so the numbers read as plausible Nigerian real
// estate listings, not just random noise.
const BLUEPRINTS = [
  { category: "house-sale", state: "Lagos", title: "Modern 4 Bedroom Duplex", price: [55_000_000, 140_000_000], bed: [3, 5], bath: [3, 5] },
  { category: "house-sale", state: "Lagos", title: "Luxury 5 Bedroom Detached House", price: [90_000_000, 180_000_000], bed: [4, 6], bath: [4, 6] },
  { category: "house-sale", state: "Oyo", title: "3 Bedroom Bungalow", price: [28_000_000, 60_000_000], bed: [2, 4], bath: [2, 3] },
  { category: "house-sale", state: "Oyo", title: "Newly Built 4 Bedroom Terrace", price: [35_000_000, 75_000_000], bed: [3, 4], bath: [3, 4] },
  { category: "rental", state: "Lagos", title: "2 Bedroom Flat for Rent", price: [1_200_000, 3_000_000], bed: [1, 3], bath: [1, 2], freq: "per-year" },
  { category: "rental", state: "Lagos", title: "3 Bedroom Serviced Apartment", price: [2_500_000, 6_000_000], bed: [2, 4], bath: [2, 3], freq: "per-year" },
  { category: "rental", state: "Oyo", title: "Self-Contained Studio Apartment", price: [350_000, 900_000], bed: [1, 1], bath: [1, 1], freq: "per-year" },
  { category: "rental", state: "Oyo", title: "2 Bedroom Mini Flat", price: [800_000, 1_800_000], bed: [1, 2], bath: [1, 2], freq: "per-year" },
  { category: "shortlet", state: "Lagos", title: "Cozy Studio Shortlet Apartment", price: [25_000, 60_000], bed: [1, 1], bath: [1, 1], freq: "per-night" },
  { category: "shortlet", state: "Lagos", title: "2 Bedroom Shortlet with Pool", price: [60_000, 120_000], bed: [2, 2], bath: [2, 2], freq: "per-night" },
  { category: "shortlet", state: "Oyo", title: "Comfortable 1 Bedroom Shortlet", price: [20_000, 45_000], bed: [1, 1], bath: [1, 1], freq: "per-night" },
  { category: "property-management", state: "Lagos", title: "3 Bedroom Duplex Available for Management", price: [150_000, 400_000], bed: [3, 4], bath: [3, 4], freq: "per-month" },
  { category: "property-management", state: "Oyo", title: "4 Bedroom Detached House for Management", price: [120_000, 300_000], bed: [4, 5], bath: [3, 5], freq: "per-month" },
  { category: "land-sale", state: "Lagos", title: "Prime Residential Land", price: [15_000_000, 45_000_000] },
  { category: "land-sale", state: "Lagos", title: "Commercial Plot of Land", price: [25_000_000, 60_000_000] },
  { category: "land-sale", state: "Oyo", title: "Dry Land Fenced and Gated", price: [4_000_000, 15_000_000] },
  { category: "land-sale", state: "Oyo", title: "Land Suitable for Estate Development", price: [8_000_000, 25_000_000] },
  { category: "house-sale", state: "Lagos", title: "3 Bedroom Semi-Detached Duplex", price: [45_000_000, 95_000_000], bed: [3, 3], bath: [3, 4] },
  { category: "rental", state: "Lagos", title: "1 Bedroom Apartment for Rent", price: [700_000, 1_500_000], bed: [1, 1], bath: [1, 1], freq: "per-year" },
  { category: "shortlet", state: "Oyo", title: "3 Bedroom Shortlet Duplex", price: [70_000, 140_000], bed: [3, 3], bath: [3, 3], freq: "per-night" },
];

async function uploadImage(url, index) {
  const result = await cloudinary.uploader.upload(url, {
    folder: "richlux/listings",
    public_id: `seed-${Date.now()}-${index}`,
  });
  return {
    type: "image",
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    isCover: true,
  };
}

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set -- run with node --env-file=.env.local scripts/seedListings.js");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  await mongoose.connect(process.env.MONGODB_URI, { dbName: "richlux" });
  const Listing = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);

  const staff = await User.find({ role: { $in: ["agent", "manager", "superadmin"] } });
  if (staff.length === 0) {
    throw new Error(
      "No agent/manager/superadmin user found -- promote one first (node scripts/promoteSuperAdmin.js <email>)"
    );
  }

  console.log(`Seeding ${BLUEPRINTS.length} listings, owned by ${staff.length} staff account(s)...`);

  for (let i = 0; i < BLUEPRINTS.length; i++) {
    const bp = BLUEPRINTS[i];
    const isLandSale = bp.category === "land-sale";
    const lgas = bp.state === "Lagos" ? LAGOS_LGAS : OYO_LGAS;
    const city = lgas[randomBetween(0, lgas.length - 1)];
    const owner = staff[i % staff.length];
    const imageUrl = IMAGE_URLS[i % IMAGE_URLS.length];

    console.log(`[${i + 1}/${BLUEPRINTS.length}] Uploading image and creating "${bp.title}" (${city}, ${bp.state})...`);
    const media = [await uploadImage(imageUrl, i)];

    await Listing.create({
      title: `${bp.title} in ${city}`,
      description: `${bp.title} located in ${city}, ${bp.state} State. A great fit for anyone searching in this area -- reach out for more details or to schedule a viewing.`,
      category: bp.category,
      price: randomBetween(bp.price[0], bp.price[1]),
      priceFrequency: bp.freq || "one-time",
      location: { address: `${city}, ${bp.state}`, city, state: bp.state },
      bedrooms: isLandSale ? undefined : randomBetween(bp.bed[0], bp.bed[1]),
      bathrooms: isLandSale ? undefined : randomBetween(bp.bath[0], bp.bath[1]),
      landSize: isLandSale ? `${randomBetween(1, 5)} plots` : undefined,
      amenities: isLandSale ? [] : pick(AMENITIES_POOL, randomBetween(2, 5)),
      media,
      status: "available",
      approvalStatus: "approved",
      agent: owner._id,
      isFeatured: i < 3,
    });
  }

  console.log("Done.");
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
