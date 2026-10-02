const express = require("express");
const router = express.Router();
const {
    getAllFreelancers,
    getFreelancerPortfolio,
    updatePortfolio
} = require("../controllers/portfolioController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");

router.get("/", getAllFreelancers);
router.get("/:freelancerId", validateObjectId("freelancerId"), getFreelancerPortfolio);
router.put("/", protect, authorize("freelancer"), updatePortfolio);

module.exports = router;
