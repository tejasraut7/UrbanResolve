import express from "express";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

// import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  // methods: ["GET", "POST", "PUT", "DELETE"],
  // allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10kb" }));
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/upload", uploadRoutes);

// app.use(errorHandler);



export default app;