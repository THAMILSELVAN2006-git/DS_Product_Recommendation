const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

exports.registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 characters"),
];

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { name, email, password } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = signToken(user);
    res.status(201).json({
      success: true,
      data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: "Invalid credentials format" });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const token = signToken(user);
    res.json({
      success: true,
      data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getMe = (req, res) => {
  res.json({ success: true, data: req.user });
};
