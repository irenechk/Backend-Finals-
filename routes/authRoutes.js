const express = require("express");
const router = express.Router();
const { register, login, getMe, updateFcmToken } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../middleware/validationMiddleware");

// Public authentication routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Private profile routes
router.get("/me", protect, getMe);
router.put("/fcm-token", protect, updateFcmToken);

module.exports = router;
