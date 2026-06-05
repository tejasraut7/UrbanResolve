export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(e => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({ success: false, code: "VALIDATION_ERROR", errors });
  }
  req.body = result.data; // replace with sanitized data
  next();
};