import mongoose from "mongoose";

export const connectToDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "richlux",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
  }
};
