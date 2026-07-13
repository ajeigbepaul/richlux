import mongoose from "mongoose";

export const connectToDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Previously this swallowed connection errors, so every caller assumed
  // success and went on to query anyway -- the query then hung on Mongoose's
  // command buffering until its own timeout, doubling the delay before a
  // request finally failed. Fail fast and let callers' try/catch handle it.
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "richlux",
    serverSelectionTimeoutMS: 5000,
  });
};
