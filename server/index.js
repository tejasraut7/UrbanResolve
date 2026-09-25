import dns from 'dns';
import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
console.log('URI:', process.env.MONGO_URI);
console.log("ENV CHECK:", {
  mongoUri: !!process.env.MONGO_URI,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  port: process.env.PORT,
});

dns.setServers(['8.8.8.8', '1.1.1.1']);
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });