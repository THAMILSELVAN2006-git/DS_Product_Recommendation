const router = require("express").Router();
const ctrl = require("../controllers/wishlistController");
const auth = require("../middleware/authMiddleware");

router.use(auth);
router.post("/", ctrl.addToWishlist);
router.get("/", ctrl.getWishlist);
router.delete("/:id", ctrl.removeFromWishlist);

module.exports = router;
