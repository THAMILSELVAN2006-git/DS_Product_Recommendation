const router = require("express").Router();
const ctrl = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.use(auth, admin);
router.get("/stats", ctrl.getStats);
router.get("/users", ctrl.getUsers);
router.get("/searches", ctrl.getTopSearches);
router.get("/popular-products", ctrl.getPopularProducts);

module.exports = router;
