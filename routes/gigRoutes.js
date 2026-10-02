const express = require("express");
const router = express.Router();
const {
    getGigs,
    getGigById,
    createGig,
    updateGig,
    deleteGig
} = require("../controllers/gigController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateObjectId, validateGigCreate } = require("../middleware/validationMiddleware");

// Public endpoints
router.get("/", getGigs);
router.get("/:id", validateObjectId("id"), getGigById);

// Protected endpoints
router.post("/", protect, authorize("client"), validateGigCreate, createGig);
router.put("/:id", protect, validateObjectId("id"), updateGig);
router.delete("/:id", protect, validateObjectId("id"), deleteGig);

module.exports = router;
