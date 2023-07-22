const Product = require("../models/productModel");
const resError = require("./resError");

const updateStock = async (id, quantity, res) => {
  const product = await Product.findById(id);

  if(!product) {
    return  resError(404, "Product not found to update stock", res);
  }

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
};

module.exports = updateStock;
