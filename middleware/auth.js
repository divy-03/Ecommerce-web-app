const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const resError = require("../utils/resError");
require("dotenv").config(); // Load environment variables from .env file, if present.

exports.fetchUser = async (req, res, next) => {
  const { authToken } = req.cookies;

  if (!authToken) {
    resError(401, "Please authenticate using a valid token", res);
  }

  try {
    const data = jwt.verify(authToken, process.env.JWT_SECRET);

    req.user = await userModel.findById(data.user.id);

    next();
  } catch (error) {
    resError(401, "Please authenticate using valid token");
  }
};

exports.authRole = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return resError(
        403,
        `Role: ${req.user.role} is not allowed to access this resource`,
        res
      );
    }
    next();
  };
};


