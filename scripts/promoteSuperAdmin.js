/**
 * One-off helper to promote a single account to superadmin. There is no
 * self-service "become admin" flow by design -- this is the only way to
 * mint the first Super Admin.
 *
 * Usage: node -r dotenv/config scripts/promoteSuperAdmin.js dotenv_config_path=.env.local you@example.com
 */
const mongoose = require("mongoose");
const { User } = require("../model/User");

async function run() {
  const email = process.argv[2];
  if (!email) {
    throw new Error("Usage: node scripts/promoteSuperAdmin.js <email>");
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(process.env.MONGODB_URI, { dbName: "richlux" });

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: "superadmin" } },
    { new: true }
  );

  if (!user) {
    throw new Error(`No user found with email ${email}`);
  }
  console.log(`Promoted ${user.email} to superadmin.`);

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Promotion failed:", error);
  process.exit(1);
});
