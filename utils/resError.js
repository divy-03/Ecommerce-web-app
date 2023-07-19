const resError = (statusCode, message, res) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = resError;
