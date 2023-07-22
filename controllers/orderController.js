const Order = require("../models/orderModel");
// const Product = require("../models/productModel");
// const resSuccess = require("../utils/resSuccess");
const resError = require("../utils/resError");

// Create a new Order
exports.newOrder = async (req, res) => {
  try {
    const {
      shippingInfo,
      paymentMethod,
      orderItems,
      totalPrice,
      paymentInfo,
      shippingPrice,
      itemsPrice,
      taxPrice,
    } = req.body;

    const order = await Order.create({
      shippingInfo,
      paymentMethod,
      orderItems,
      totalPrice,
      paymentInfo,
      itemsPrice,
      shippingPrice,
      taxPrice,
      paidAt: Date.now(),
      user: req.user.id,
    });

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    resError(500, `${error} => while creating order`, res);
  }
};
