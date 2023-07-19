const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const resError = require("../utils/resError");
const dotenv = require("dotenv");
dotenv.config({ path: "backend/config/config.env" });

exports.fetchUser = async (req, res, next) => {
  const { authToken } = req.cookies;

  if (!authToken) {
    return resError(401, "Please authenticate using a valid token", res);
  }

  try {
    const data = jwt.verify(authToken, process.env.JWT_SECRET);

    req.user = await userModel.findById(data.user.id);

    next();
  } catch (error) {
    resError(401, "Please authenticate using valid token", res);
  }
};

exports.authRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return resError(
        403, `Role: ${req.user.role} is not allowed to access this resource`, res);
    }
    next();
  };
};
