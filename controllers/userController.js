const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const dotenv = require("dotenv");
const sendToken = require("../utils/jwtToken");
const resError = require("../utils/resError");
const resSuccess = require("../utils/resSuccess");

dotenv.config({ path: "backend/config/config.env" });

// Register a user
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: secPass,
      avatar: {
        public_id: "This is a sample id",
        url: "profilePictureUrl",
      },
    });

    sendToken(user, 201, res);
  } catch (error) {
    if (error.code === 11000) {
      const message = `email: ${error.keyValue.email} is already registered with us`;
      res.status(400).json({ success: false, error: message });
    } else {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};

// Login User
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    await check("email", "Please enter a valid email").isEmail().run(req);
    await check("password", "Please enter a password").notEmpty().run(req);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    } else {
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({ error: "Invalid email or passsword" });
      }

      const savedPassword = user.password;

      const passwordCompare = await bcrypt.compare(password, savedPassword);

      if (!passwordCompare) {
        resError(401, "password not matched", res);
      } else {
        // console.log(user.id, user._id);
        sendToken(user, 200, res);
      }
    }
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};

// LogOut User
exports.logoutUser = async (req, res, next) => {
  try {
    res.cookie("authToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    resSuccess(200, "Logged Out Successfully", res);
  } catch (error) {}
};
