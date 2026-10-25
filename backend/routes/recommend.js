const router = require("express").Router();
const { recommend } = require("../controllers/recommendationController");
router.post("/", recommend);
module.exports = router;
