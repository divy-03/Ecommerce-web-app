const resSuccess = (statusCode, message, res) => {
    return res.status(statusCode).json({
      success: true,
      message,
    });
  };
  
  module.exports = resSuccess;
  