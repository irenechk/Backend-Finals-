const express = require("express");
const router = express.Router();
const {
    createDispute,
    getDisputes,
    updateDispute
} = require("../controllers/disputeController");
const { protect } = require("../middleware/authMiddleware");
const { validateObjectId, validateDisputeCreate } = require("../middleware/validationMiddleware");

// All dispute routes require authentication
router.use(protect);

router.post("/", validateDisputeCreate, createDispute);
router.get("/", getDisputes);
router.put("/:id", validateObjectId("id"), updateDispute);

module.exports = router;
