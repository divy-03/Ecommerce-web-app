const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const resSuccess = require("../utils/resSuccess");
const resError = require("../utils/resError");
const updateStock = require("../utils/updateStock");

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
    const order = await Order.findOne({ _id: orderId, user: userId });
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

// Get Single Order --- ADMIN
exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "orderItems.product",
        select: "name price",
      });

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
    const orders = await Order.find().populate("user", "name email");

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

// Update Order Status --- ADMIN
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    const productStatus = req.body.status;

    if (!order) {
      return resError(404, "Order not found", res);
    }

    if (order.orderStatus === "Delivered") {
      return resError(404, "You have already delivered this order", res);
    }

    order.orderItems.forEach(async (ordr) => {
      await updateStock(ordr.product, ordr.quantity, res);
    });

    order.orderStatus = productStatus;

    if (productStatus === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    return resSuccess(
      200,
      `Poduct status updated successfully to ${productStatus}`,
      res
    );
  } catch (error) {
    resError(500, `${error}=>while updating orders`, res);
  }
};

// Delete Order --- ADMIN
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      resError(404, "Order not found", res);
    }

    await order.deleteOne();

    return resSuccess(200, "Order deleted successfully", res);
  } catch (error) {
    resError(500, `${error}=>while deleting orders`, res);
  }
};
