const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.messaage = err.message || "Internal Server Error";

  res.status(err.statusCode).json({
    success: false,
    error: err.messaage, 
  });
};
