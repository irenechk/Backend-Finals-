const express = require("express");
const router = express.Router();
const {
    fundEscrow,
    releaseEscrow,
    refundEscrow,
    getEscrowStatus
} = require("../controllers/escrowController");
const { protect } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");

router.use(protect);

router.post("/fund/:milestoneId", validateObjectId("milestoneId"), fundEscrow);
router.post("/release/:milestoneId", validateObjectId("milestoneId"), releaseEscrow);
router.post("/refund/:milestoneId", validateObjectId("milestoneId"), refundEscrow);
router.get("/status/:milestoneId", validateObjectId("milestoneId"), getEscrowStatus);

module.exports = router;
