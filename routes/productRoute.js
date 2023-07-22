const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createReview,
  deleteReview,
  getAllReviews,
} = require("../controllers/productController");
const { fetchUser, authRole } = require("../middleware/auth");
const router = express.Router();

router.route("/products").get(getAllProducts);
router.route("/admin/product/new").post(fetchUser, authRole("admin", "owner"), createProduct);
router.route("/admin/product/update/:id").put(fetchUser, authRole("admin", "owner"), updateProduct);
router.route("/admin/product/delete/:id").delete(fetchUser, authRole("admin", "owner"), deleteProduct);
router.route("/product/get/:id").get(getProductDetails);
router.route("/review").put(fetchUser, createReview);
router.route("/review").delete(fetchUser, deleteReview);
router.route("/reviews").get(getAllReviews);

module.exports = router;
