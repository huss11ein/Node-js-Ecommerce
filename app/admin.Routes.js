const router = require("express").Router();
const multer = require("multer");
const AdminAuth = require(".././middleware/adminAuth");
const AdminProudectController = require(".././Controller/Admin/Products.Controller");
const AdminCategoryController = require(".././Controller/Admin/Category.model");
const AdminController = require(".././Controller/Admin/Admin.controller");

const shippingFees = require(".././Controller/Admin/Shipping.controller");
const transactions = require(".././Controller/Admin/transactions.controller");
const blockedUsers = require(".././Controller/Admin/Blocking.controller");
const upload = multer({ dest: "images/" });
const request = require(".././Controller/Admin/Return.controller");
const adminAuth = require(".././middleware/adminAuth");
const uploadimage = require("../middleware/uploadImage");
const Return = require(".././Controller/Admin/Return.controller");
const exelMulter = require("../middleware/uploadexcel");
const order = require("../Controller/User/Order.controller");

// router.post("/profile", userController.uploadProfileImage);
////////////////Login //////////////////////////////
router.post("/login", AdminController.login);
//////////////////////////// product ///////////////////////////////////

router.post("/AddProduct", AdminAuth, AdminProudectController.addProduct);
router.post(
  "/productImage/:id",
  AdminAuth,
  uploadimage.array("productImage"),

  AdminProudectController.uploadProductImages
);
router.post("/deleteImage/:id", adminAuth, AdminProudectController.deleteImage);
router.post(
  "/updateProduct/:id",
  AdminAuth,
  AdminProudectController.updateProduct
);
router.post(
  "/deleteProduct/:id",
  AdminAuth,
  AdminProudectController.deleteProduct
);
router.get("/products", AdminAuth, AdminProudectController.Allproducts);
router.get(
  "/SingleProduct/:id",
  AdminAuth,
  AdminProudectController.GetOneProduct
);
router.post("/deleteImage/:id", adminAuth, AdminProudectController.deleteImage);
/////////////////////////// category ////////////////////////////////////////////
router.post(
  "/categoryImage/:id",
  AdminAuth,
  uploadimage.array("categoryImage"),

  AdminCategoryController.uploadCategoryImage
);
router.post(
  "/export",
  AdminAuth,
  exelMulter.single("file"),

  AdminProudectController.exportexcel
);
router.post("/AddCategory", AdminAuth, AdminCategoryController.addCategory);
router.post(
  "/UpdateCategory/:id",
  AdminAuth,
  AdminCategoryController.updateCategory
);

router.post(
  "/DeleteCategory/:id",
  AdminAuth,
  AdminCategoryController.deleteCategory
);
router.get("/GetCategories", AdminAuth, AdminCategoryController.getCategory);
router.get(
  "/GetCategory/:id",
  AdminAuth,
  AdminCategoryController.getOneCategory
);
router.post(
  "/AddSubCategory/:id",
  AdminAuth,
  AdminCategoryController.addSubCategory
);
router.post(
  "/DeleteSubCategory/:id",
  AdminAuth,
  AdminCategoryController.DeleteSubCategory
);
router.get(
  "/getSubCategory/:id",
  AdminAuth,
  AdminCategoryController.getsubCategory
);
///////////////////////// transaction ////////////////////////

router.get("/transactions/", AdminAuth, transactions.getTransactions);
router.get("/returnReq", AdminAuth, request.GetALLRequests);
router.get(
  "/transactionsorted/",
  AdminAuth,
  transactions.getTransactionssorted
);
router.post("/order/search", AdminAuth, transactions.search);
router.post("/return/search", AdminAuth, Return.returnSearch);
router.post("/search", AdminAuth, order.search);

router.post("/changeReturnReq", AdminAuth, request.changeRequestStatus);
router.post(
  "/upadteTransactions",
  AdminAuth,
  transactions.changeTransactionstatus
);

router.post(
  "/ChangeShowingProduct/:id",
  AdminAuth,
  AdminProudectController.ChangeShowingProduct
);

module.exports = router;
