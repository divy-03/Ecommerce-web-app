const express = require("express");
const router = express.Router();

const { fetchUser, authRole } = require("../middleware/auth");
const { newOrder } = require("../controllers/orderController");

router.route("/order/new").post(fetchUser, newOrder);

module.exports = router;