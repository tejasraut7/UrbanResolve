export const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ success: false, code: "VALIDATION_ERROR", errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      code: "DUPLICATE_ERROR",
      message: `${field} already exists`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, code: "INVALID_ID", message: "Invalid ID format" });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, code: "INVALID_TOKEN", message: "Invalid token" });
  }

  // Default 500
  res.status(err.status || 500).json({
    success: false,
    code: "SERVER_ERROR",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message,
  });
  
};