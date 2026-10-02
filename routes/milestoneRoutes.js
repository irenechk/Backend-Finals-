const express = require("express");
const router = express.Router();
const {
    createMilestone,
    getMilestones,
    updateMilestone
} = require("../controllers/milestoneController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateObjectId, validateMilestoneCreate } = require("../middleware/validationMiddleware");

// All milestone routes require authentication
router.use(protect);

router.post("/", authorize("client", "admin"), validateMilestoneCreate, createMilestone);
router.get("/", getMilestones);
router.put("/:id", validateObjectId("id"), updateMilestone);

module.exports = router;
