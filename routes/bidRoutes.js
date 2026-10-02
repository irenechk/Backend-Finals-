const express = require("express");
const router = express.Router();
const {
    createBid,
    getBids,
    getBidById,
    updateBid
} = require("../controllers/bidController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateObjectId, validateBidCreate } = require("../middleware/validationMiddleware");

// All bid routes require authentication
router.use(protect);

router.post("/", authorize("freelancer"), validateBidCreate, createBid);
router.get("/", getBids);
router.get("/:id", validateObjectId("id"), getBidById);
router.put("/:id", validateObjectId("id"), updateBid);

module.exports = router;
