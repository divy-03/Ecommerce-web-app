const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
} = require("../controllers/productController");
const fetchUser = require("../middleware/auth");

const router = express.Router();

router.route("/products").get( fetchUser, getAllProducts);
router.route("/product/new").post(createProduct);
router.route("/product/update/:id").put(updateProduct);
router.route("/product/delete/:id").delete(deleteProduct);
router.route("/product/get/:id").get(getProductDetails);

module.exports = router;
