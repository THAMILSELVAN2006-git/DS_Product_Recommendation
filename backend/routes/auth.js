const router = require("express").Router();
const { register, login, getMe, registerValidation, loginValidation } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: "Too many login attempts" } });

router.post("/register", registerValidation, register);
router.post("/login", loginLimiter, loginValidation, login);
router.get("/me", authMiddleware, getMe);

module.exports = router;
