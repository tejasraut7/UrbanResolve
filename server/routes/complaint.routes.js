import express from "express";
import {
  createComplaint,
  getAllComplaints,
  getAnalytics,
 
} from "../controllers/complaint.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { batchUpdateStatus, updateStatus } from "../controllers/status.controller.js";
import { validate } from "../middleware/validate.js";
import {
  batchUpdateStatusSchema,
  createComplaintSchema,
  updateStatusSchema,
} from "../validators/complaint.validator.js";
import { complaintLimiter } from "../middleware/rateLimiter.middleware.js";


const router = express.Router();

router.post("/", complaintLimiter, validate(createComplaintSchema), createComplaint);
router.put(
  "/status/batch",
  protect,
  validate(batchUpdateStatusSchema),
  batchUpdateStatus
);
router.put("/status", protect, validate(updateStatusSchema), updateStatus);
router.get("/",getAllComplaints);
router.get("/analytics", protect,getAnalytics);

export default router;