const express = require("express");
const router = express.Router();

const { fetchUser, authRole } = require("../middleware/auth");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getMyOrder,
  getAllOrders,
  updateOrder,
} = require("../controllers/orderController");

router.route("/order/new").post(fetchUser, newOrder);
router.route("/orders/my").get(fetchUser, myOrders);
router.route("/order/my/:id").get(fetchUser, getMyOrder);
router.route("/admin/order/:id").get(fetchUser, authRole("admin", "owner"), getSingleOrder);
router.route("/admin/orders/all").get(fetchUser, authRole("admin", "owner"), getAllOrders);
router.route("/admin/order/update/:id").put(fetchUser, authRole("admin", "owner"), updateOrder);

module.exports = router;
