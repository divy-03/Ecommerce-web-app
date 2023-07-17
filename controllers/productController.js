const Product = require("../models/productModel");
const Features = require("../utils/features");
const dotenv = require("dotenv");
// const ErrorHandler = require("../utils/errorHandler");
// const catchAsyncError = require("../middleware/catchAsyncError");

//Importing config file
dotenv.config({ path: "backend/config/config.env" });

// Create Product --- ADMIN
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      const message = `Resource not found. Invalid: ${error.path}`;
      res.status(400).json({ success: false, error: message });
    } else {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};

// Get all Products
exports.getAllProducts = async (req, res) => {
  const resultPerPage = process.env.resultPerPage;
  const productCount = await Product.countDocuments();

  try {
    const apiFeature = new Features(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);

    const products = await apiFeature.query;

    res.status(200).json({ success: true, products, productCount });
  } catch (error) {
    if (error.name === "CastError") {
      const message = `Resource not found. Invalid: ${error.path}`;
      res.status(400).json({ success: false, error: message });
    } else {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};

// Get Product Details
exports.getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(500).json({
        success: false,
        message: "Product not found",
      });
    }

    await res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      const message = `Resource not found. Invalid: ${error.path}`;
      res.status(400).json({ success: false, error: message });
    } else {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};

// Update Product --- ADMIN
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(500).json({
        success: false,
        message: "Product not found",
      });
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
    if (error.name === "CastError") {
      const message = `Resource not found. Invalid: ${error.path}`;
      res.status(400).json({ success: false, error: message });
    } else {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};

// Delete Product --- ADMIN
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(500).json({
        success: false,
        message: "Product not found",
      });
    }
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      const message = `Resource not found. Invalid: ${error.path}`;
      res.status(400).json({ success: false, error: message });
    } else {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};
