const resError = require("../utils/resError");

const castError = (error, res) => {
  if (error.name === "CastError") {
    const message = `Resource not found. Invalid: ${error.path}`;
    resError(400, message, res);
  } else {
    resError(400, error.message, res);
  }
};

module.exports = castError;