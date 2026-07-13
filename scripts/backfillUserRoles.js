/**
 * One-time migration: existing User documents predate the `role` field.
 * Mongoose schema defaults do not retroactively write onto already-persisted
 * documents, so this must run once against production data before RBAC checks
 * go live, otherwise every pre-existing account reads `role: undefined`.
 *
 * Usage: node -r dotenv/config scripts/backfillUserRoles.js dotenv_config_path=.env.local
 */
const mongoose = require("mongoose");
const { User } = require("../model/User");

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(process.env.MONGODB_URI, { dbName: "richlux" });

  const result = await User.updateMany(
    { role: { $exists: false } },
    { $set: { role: "user", isActive: true } }
  );
  console.log(`Backfilled role on ${result.modifiedCount} user(s).`);

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
