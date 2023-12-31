const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const dotenv = require("dotenv");
const crypto = require("crypto");
const sendToken = require("../utils/jwtToken");
const resError = require("../utils/resError");
const resSuccess = require("../utils/resSuccess");
const sendEmail = require("../utils/sendEmail");

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

    return sendToken(user, 201, res);
  } catch (error) {
    if (error.code === 11000) {
      return resError(400, "email already registered", res);
    } else {
      return resError(400, error.message, res);
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
      return resError(400, errors.array(), res);
    } else {
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return resError(401, "Invalid email or passsword", res);
      }

      const savedPassword = user.password;

      const passwordCompare = await bcrypt.compare(password, savedPassword);

      if (!passwordCompare) {
        return resError(401, "password not matched", res);
      } else {
        return sendToken(user, 200, res);
      }
    }
  } catch (error) {
    resError(500, error, res);
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
  } catch (error) {
    resError(500, error, res);
  }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return resError(404, "User not found", res);
    }

    // Get resetPasswordToken
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset link is => \n\n ${resetPasswordUrl} \n\nIf you have not requested to reset password then please ignore this mail`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Ecommerce Website Password Recovery",
        message: message,
        html: `<div style="background-image: linear-gradient(to right bottom, #ae95ffab 40%, rgb(210, 103, 117, 0.4)); margin:0;">
                    <h1 style="color: #333; margin-left: 10px;">Password Reset Link</h1>
                    <p style="font-size: 16px; margin-left:20px;">Click this link below to reset your password of Ecommerce Website</p>
                    <a href="${resetPasswordUrl}" style="text-decoration: none; background: black; color: white; border-radius: 8px; padding: 10px; text-align: center; width: 80px; margin-left: 50px; transition: background 0.3s;" onmouseover="this.style.background='rgb(45 45 45)'"
                    onmouseout="this.style.background='black'">Click Here!</a>
                    <p style="font-size: 16px; margin-left:20px;">If you didn't requested to reset password then please ignore this mail</p>
              </div>`,
      });

      resSuccess(200, `Email sent to ${user.email}`, res);
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return resError(500, error.message, res);
    }
  } catch (error) {
    resError(500, error, res);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    // Creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return resError(404, "Reset Password Link is invalid or expired", res);
    }

    if (req.body.password !== req.body.confirmPassword) {
      return resError(400, "Password does not match", res);
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    user.password = secPass;

    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    resError(500, `${error} occured while resetting password`, res);
  }
};

// Get User Detail
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findOne(req.user._id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    resError(500, error, res);
  }
};

// Update user password
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findOne(req.user._id).select("+password");

    const passwordCompare = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );

    if (!passwordCompare) {
      return resError(401, "password not matched", res);
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return resError(401, "New password not matched", res);
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.newPassword, salt);

    user.password = secPass;

    await user.save();

    return sendToken(user, 200, res);
  } catch (error) {
    resError(500, `${error} occured while changing password`, res);
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };

    // TODO: add cloudinary later for avatar image

    const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    resSuccess(200, "Profile updated successfully", res);
  } catch (error) {
    resError(500, `${error} occured in updating profile`, res);
  }
};

// Get All Users --- ADMIN
exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    resError(500, `${error} occured while getting all users`, res);
  }
};

// Get Single User Information --- ADMIN
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return resError(404, `User not found with id: ${req.params.id}`);
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    resError(500, `${error} occured while getting user`, res);
  }
};

// Edit User Profile and role --- ADMIN
exports.editUserRole = async (req, res) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      userFindAndModify: false,
    });

    if (!user) {
      return resError(404, "User not found", res);
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return resError(500, `${error} occured while changing role`);
  }
};

// Delete User --- ADMIN
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    // TODO: remove cloudinary later

    if (!user) {
      return resError(404, `User not found with id: ${req.params.id}`);
    }

    await user.deleteOne();

    resSuccess(200, `User with id: ${req.params.id} deleted successfully`, res);
  } catch (error) {
    resError(500, `${error} occured while deleting user`, res);
  }
};
