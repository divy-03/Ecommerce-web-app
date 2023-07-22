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

// Get Single Order --- ADMIN
exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return resError(404, "Order not found", res);
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    resError(500, `${error} => while getting order`, res);
  }
};

// Get all my Order
exports.myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount = totalAmount + order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    resError(500, `${error} => while getting orders`, res);
  }
};

// Get My Order
exports.getMyOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Find the order by both its ID and the current user ID
    const order = await Order.findOne({ _id: orderId, user: userId })
    if (!order) {
      return resError(404, "Order not found", res);
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    resError(500, `${error} => while getting order`, res);
  }
};

// Get All Orders --- ADMIN
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate(
        "user",
        "name email"
      );

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount = totalAmount + order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    resError(500, `${error}=>while getting orders`, res);
  }
};
