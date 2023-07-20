const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
} = require("../controllers/userController");
const router = express.Router();

router.route("/auth/register").post(registerUser);
router.route("/auth/login").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/auth/logout").get(logoutUser);
module.exports = router;
