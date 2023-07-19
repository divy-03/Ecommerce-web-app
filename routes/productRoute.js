const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
} = require("../controllers/productController");
const {fetchUser, authRole} = require("../middleware/auth");
const router = express.Router();

router.route("/products").get(getAllProducts);
router.route("/product/new").post(fetchUser, authRole("admin"), createProduct);
router.route("/product/update/:id").put(fetchUser, authRole("admin"), updateProduct);
router.route("/product/delete/:id").delete(fetchUser, authRole("admin"), deleteProduct);
router.route("/product/get/:id").get(getProductDetails);

module.exports = router;
