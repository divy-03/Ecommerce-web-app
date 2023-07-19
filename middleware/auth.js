const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
require("dotenv").config(); // Load environment variables from .env file, if present.

const fetchUser = async (req, res, next) => {
  const { authToken } = req.cookies;

  if (!authToken) {
    return res.status(401).json({
      success: false,
      error: "Please authenticate using a valid token",
    });
  }

  try {
    const data = jwt.verify(authToken, process.env.JWT_SECRET);

    req.user = await userModel.findById(data.id);


    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Please authenticate using valid token",
    });
  }
};

module.exports = fetchUser;
