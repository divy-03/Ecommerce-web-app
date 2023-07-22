const express = require("express");
const router = express.Router();

const { fetchUser, authRole } = require("../middleware/auth");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getMyOrder,
  getAllOrders,
} = require("../controllers/orderController");

router.route("/order/new").post(fetchUser, newOrder);
router.route("/order/:id").get(fetchUser, authRole("admin", "owner"), getSingleOrder);
router.route("/orders").get(fetchUser, myOrders);
router.route("/my-order/:id").get(fetchUser, getMyOrder);
router.route("/orders/all").get(fetchUser, authRole("admin", "owner"), getAllOrders);

module.exports = router;
