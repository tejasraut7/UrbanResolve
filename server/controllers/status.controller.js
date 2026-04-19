import { Complaint } from "../Models/complaints.model.js";

// Define EXACTLY which transitions are legal
const VALID_TRANSITIONS = {
  OPEN:        ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED"],
  RESOLVED:    ["CLOSED"],
  CLOSED:      [],      // terminal state
  REJECTED:    [],      // terminal state
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id, status: newStatus } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const currentStatus = complaint.status;
    const allowedNext = VALID_TRANSITIONS[currentStatus];

    // Reject illegal transitions
    if (!allowedNext.includes(newStatus)) {
      return res.status(409).json({
        success: false,
        code: "INVALID_TRANSITION",
        message: `Cannot move from ${currentStatus} to ${newStatus}`,
        allowedTransitions: allowedNext,
      });
    }

    const updated = await Complaint.findByIdAndUpdate(
      id,
      {
        status: newStatus,
        $push: {
          statusHistory: {
            status: newStatus,
            updatedBy: req.user?.id || null,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const batchUpdateStatus = async (req, res, next) => {
  try {
    const { ids, status: newStatus } = req.body;
    const results = [];

    for (const id of ids) {
      const complaint = await Complaint.findById(id);
      if (!complaint) {
        results.push({ id, ok: false, message: "Complaint not found" });
        continue;
      }
      const currentStatus = complaint.status;
      const allowedNext = VALID_TRANSITIONS[currentStatus];
      if (!allowedNext.includes(newStatus)) {
        results.push({
          id,
          ok: false,
          message: `Cannot move from ${currentStatus} to ${newStatus}`,
        });
        continue;
      }
      await Complaint.findByIdAndUpdate(
        id,
        {
          status: newStatus,
          $push: {
            statusHistory: {
              status: newStatus,
              updatedBy: req.user?.id || null,
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      );
      results.push({ id, ok: true });
    }

    const ok = results.filter((r) => r.ok).length;
    const failed = results.length - ok;
    res.status(200).json({ success: true, results, summary: { ok, failed } });
  } catch (error) {
    next(error);
  }
};