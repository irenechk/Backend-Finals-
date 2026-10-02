const express = require("express");
const router = express.Router();
const {
    createOrGetChat,
    getChats,
    getChatById,
    sendMessage
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");

// All chat routes require authentication
router.use(protect);

router.post("/", createOrGetChat);
router.get("/", getChats);
router.get("/:id", validateObjectId("id"), getChatById);
router.post("/:id/messages", validateObjectId("id"), sendMessage);

module.exports = router;
