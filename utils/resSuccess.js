const resSuccess = (statusCode, message, res) => {
    return res.status(statusCode).json({
      success: true,
      error: message,
    });
  };
  
  module.exports = resSuccess;
  