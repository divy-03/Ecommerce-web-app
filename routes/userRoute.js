const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getUser,
} = require("../controllers/userController");
const { fetchUser, authRole } = require("../middleware/auth");
const router = express.Router();

router.route("/auth/register").post(registerUser);
router.route("/auth/login").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/auth/logout").get(fetchUser, logoutUser);
router.route("/me").get(fetchUser, getUserDetails);
router.route("/password/update").put(fetchUser, updatePassword);
router.route("/me/update").put(fetchUser, updateProfile);
router.route("/admin/users").get(fetchUser, authRole("admin"), getAllUser);
router.route("/admin/user/:id").get(fetchUser, authRole("admin"), getUser);

module.exports = router;
