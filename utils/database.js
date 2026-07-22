import mongoose from "mongoose";

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 700;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Several requests can land before the very first connection settles (e.g.
// the homepage's server-rendered fetch and a couple of client-side API
// calls, all in the same cold-start burst) -- without sharing one in-flight
// attempt, each of them called mongoose.connect() independently and raced,
// which surfaced as intermittent 500s right after a fresh server start.
let connectingPromise = null;

async function attemptConnect() {
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
}

export const connectToDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectingPromise) {
    connectingPromise = attemptConnect().finally(() => {
      connectingPromise = null;
    });
  }

  return connectingPromise;
};
