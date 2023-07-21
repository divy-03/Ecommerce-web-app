const Product = require("../models/productModel");
const Features = require("../utils/features");
const dotenv = require("dotenv");
const resSuccess = require("../utils/resSuccess");
const resError = require("../utils/resError");
const castError = require("../utils/castError");
// const ErrorHandler = require("../utils/errorHandler");
// const catchAsyncError = require("../middleware/catchAsyncError");

//Importing config file
dotenv.config({ path: "backend/config/config.env" });

// Create Product --- ADMIN
exports.createProduct = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    return castError(error, res);
  }
};

// Get all Products
exports.getAllProducts = async (req, res) => {
  try {
    const resultPerPage = process.env.resultPerPage;
    const productCount = await Product.countDocuments();

    const apiFeature = new Features(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);

    const products = await apiFeature.query;

    res.status(200).json({ success: true, products, productCount });
  } catch (error) {
    castError(error, res);
  }
};

// Get Product Details
exports.getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return  resError(500, "Product not found", res);
    }

    await res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    castError(error, res);
  }
};

// Update Product --- ADMIN
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return resError(500, "Product not found", res);
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindandModify: false,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    castError(error, res);
  }
};

// Delete Product --- ADMIN
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return resError(500, "Product not found", res);
    }
    await product.deleteOne();

    return resSuccess(200, "Product deleted successfully", res);
  } catch (error) {
    castError(error, res);
  }
};
