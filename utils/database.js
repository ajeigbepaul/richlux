import mongoose from "mongoose";

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 700;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectToDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Previously this swallowed connection errors, so every caller assumed
  // success and went on to query anyway -- the query then hung on Mongoose's
  // command buffering until its own timeout, doubling the delay before a
  // request finally failed. Fail fast and let callers' try/catch handle it.
  //
  // This cluster's mongodb+srv:// connection string requires a DNS SRV
  // lookup on every fresh connect, and that lookup occasionally times out
  // transiently (querySrv ETIMEOUT/ESERVFAIL) independent of Mongo itself --
  // a short retry rides out the blip instead of failing every request that
  // happens to land during it.
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: "richlux",
        serverSelectionTimeoutMS: 5000,
      });
      return;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }
  throw lastError;
};
