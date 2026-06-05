import express from "express";
import  {getSignature}  from "../controllers/upload.controller.js";

const router = express.Router();

// Public route — no auth needed to get a signature
// (Cloudinary enforces the restrictions, not you)
router.get("/signature", getSignature);

export default router;