const router = require("express").Router();
const ctrl = require("../controllers/historyController");
const auth = require("../middleware/authMiddleware");

router.use(auth);
router.post("/", ctrl.addHistory);
router.get("/", ctrl.getHistory);
router.delete("/", ctrl.clearHistory);

module.exports = router;
