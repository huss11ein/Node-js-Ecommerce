const router = require("express").Router();
const SuperAdminAuth = require(".././middleware/SuperAdmin");
const superAdminController = require(".././Controller/SuperAdmin/Admin.controller");
const AdminProudectController = require(".././Controller/Admin/Products.Controller");
const AdminCategoryController = require(".././Controller/Admin/Category.model");
const AdminController = require(".././Controller/Admin/Admin.controller");
const userController = require(".././Controller/User/user.controller");
const shippingFees = require(".././Controller/Admin/Shipping.controller");
const transactions = require(".././Controller/Admin/transactions.controller");
const blockedUsers = require(".././Controller/Admin/Blocking.controller");
//////////////////////////// Admin ///////////////////////////////////
router.post("/login", userController.login);
router.post("/AddAdmin", SuperAdminAuth, superAdminController.addAdmin);
router.post(
  "/UpdateAdmin/:id",
  SuperAdminAuth,
  superAdminController.UpdateAdmin
);

router.get("/AllAdmins", SuperAdminAuth, superAdminController.getALLAdmin);
/////////////////////////// Blocking User ////////////////////////////////////
router.post("/block/:id", SuperAdminAuth, blockedUsers.blockUser);
router.get("/getblockUsers", SuperAdminAuth, blockedUsers.getALlBlockedUsers);
///////////////////////// shiping ///////////////////////////////////////////
router.get("/getcities/:name", shippingFees.GetAllCities);
router.get("/getCountries", shippingFees.GetCountries);
router.get( "/GetAllCitesWeShipToInOneCountry/:name",shippingFees.GetAllCitesWeShipTO);
router.get( "/GetAllCitesWeNOTShipToInOneCountry/:name",shippingFees.getCitesWithoutfees);

router.get("/citiesOfCountry/:id", shippingFees.getcitiesOfCountry);
router.post("/updateFess", SuperAdminAuth, shippingFees.updateFess);
router.post("/addCountry", SuperAdminAuth, shippingFees.AddCountryWithAllCites);
router.get("/allCountries", SuperAdminAuth, shippingFees.getAllCountrisInWorld);
////////////////////// codes/////////////////////////
router.post(
  "/addDiscount",
  SuperAdminAuth,
  superAdminController.addDiscountCode
);
router.get('/allCodes', SuperAdminAuth, superAdminController.getAllDiscountCode)
router.post('/deleteCode/:id', SuperAdminAuth , superAdminController.deleteCode)

module.exports = router;
