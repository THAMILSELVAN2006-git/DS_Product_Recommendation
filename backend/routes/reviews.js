const router = require("express").Router();
const ctrl = require("../controllers/reviewController");
const auth = require("../middleware/authMiddleware");

router.post("/:productId", auth, ctrl.reviewValidation, ctrl.addReview);
router.get("/:productId", ctrl.getReviews);

module.exports = router;
