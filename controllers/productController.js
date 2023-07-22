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
      return resError(500, "Product not found", res);
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

// Create New Review or Update the review
exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment: comment || "",
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user.id.toString()
    );

    if (isReviewed) {
      // update existing review with new data

      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user.id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
      avg = avg + rev.rating;
    });
    product.rating = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    resSuccess(200, "Reviewed Item successfully", res);
  } catch (error) {
    return resError(500, `${error} => while creating review`, res);
  }
};

// Get all Reviews
exports.getAllReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.query.id);

    if (!product) {
      return resError(404, "Product not found", res);
    }

    return res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    return resError(500, `${error} => while getting reviews`, res);
  }
};

//Watch at 4:04:00 // Delete Product Review
// exports.deleteReview = async (req, res) => {
//   try {
//     const product = await Product.findById(req.query.id);

//     if (!product) {
//       return resError(404, "Product not found", res);
//     }

//     let avg = 0;
//     product.reviews.forEach((rev) => {
//       avg = avg + rev.rating;
//     });

//     const rating = avg / product.reviews.length;

//     const numOfReviews = product.reviews.length;

//     await Product.findByIdAndUpdate(
//       req.query.reviewId,
//       {
//         reviews: product.reviews,
//         rating,
//         numOfReviews,
//       },
//       {
//         new: true,
//         runValidators: true,
//         useFindandModify: false,
//       }
//     );

//     return resSuccess(200, "Review deleted successfully", res);
//   } catch (error) {
//     return resError(500, `${error} => while deleting review`, res);
//   }
// };

exports.deleteReview = async (req, res) => {
  try {
    const productId = req.query.id;
    const reviewId = req.query.reviewId;

    // Find the product by its ID
    const product = await Product.findById(productId);

    if (!product) {
      return resError(404, "Product not found", res);
    }

    // Find the index of the review in the reviews array
    const reviewIndex = product.reviews.findIndex(
      (rev) => rev._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      // If the review is not found, return an error response
      return resError(404, "Review not found", res);
    }

    // Remove the review from the reviews array using $pull
    product.reviews.pull({ _id: reviewId });

    // Recalculate the average rating after removing the review
    let avg = 0;
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
    product.rating = avg / product.reviews.length;

    // Update the number of reviews
    product.numOfReviews = product.reviews.length;

    // Save the updated product
    await product.save({ validateBeforeSave: false });

    // Return a success response
    return resSuccess(200, "Review deleted successfully", res);
  } catch (error) {
    return resError(500, `${error} => while deleting review`, res);
  }
};
