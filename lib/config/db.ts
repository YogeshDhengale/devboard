import mongoose from "mongoose";

export const ConnectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI as string, {
    dbName: process.env.DB_NAME,
  });
  console.log("MongoDB connected successfully");
};
