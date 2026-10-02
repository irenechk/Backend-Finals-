const Dispute = require("../models/Dispute");
const Gig = require("../models/Gig");
const User = require("../models/User");
const { sendNotification } = require("../utils/notifications");

/**
 * @desc    Raise a new dispute on a gig/project
 * @route   POST /api/disputes
 * @access  Private (Project participants)
 */
const createDispute = async (req, res, next) => {
    try {
        const { gig: gigId, against: againstId, reason, description } = req.body;

        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found"
            });
        }

        const againstUser = await User.findById(againstId);
        if (!againstUser) {
            return res.status(404).json({
                success: false,
                message: "Target user (against) not found"
            });
        }

        if (againstId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot raise a dispute against yourself"
            });
        }

        const dispute = await Dispute.create({
            gig: gigId,
            raisedBy: req.user._id,
            against: againstId,
            reason,
            description,
            status: "open"
        });

        await dispute.populate([
            { path: "gig", select: "title client" },
            { path: "raisedBy", select: "name email role" },
            { path: "against", select: "name email role fcmToken" }
        ]);

        // Send notification to the counterparty
        await sendNotification({
            userId: againstId,
            fcmToken: againstUser.fcmToken,
            title: "Dispute Raised on Project",
            body: `${req.user.name} raised a dispute on '${gig.title}': ${reason}`,
            type: "DISPUTE_RAISED",
            payload: { disputeId: dispute._id.toString(), gigId: gig._id.toString() }
        });

        res.status(201).json({
            success: true,
            message: "Dispute raised successfully",
            data: { dispute }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get disputes (for current user or filter by gig)
 * @route   GET /api/disputes
 * @access  Private
 */
const getDisputes = async (req, res, next) => {
    try {
        const { gig: gigId, status } = req.query;
        let query = {};

        if (gigId) {
            query.gig = gigId;
            if (req.user.role !== "admin") {
                query.$or = [{ raisedBy: req.user._id }, { against: req.user._id }];
            }
        } else {
            if (req.user.role !== "admin") {
                query.$or = [{ raisedBy: req.user._id }, { against: req.user._id }];
            }
        }

        if (status) query.status = status;

        const disputes = await Dispute.find(query)
            .populate("gig", "title budget status")
            .populate("raisedBy", "name email role")
            .populate("against", "name email role")
            .populate("resolvedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: disputes.length,
            message: "Disputes retrieved successfully",
            data: { disputes }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update dispute status or resolution
 * @route   PUT /api/disputes/:id
 * @access  Private
 */
const updateDispute = async (req, res, next) => {
    try {
        const dispute = await Dispute.findById(req.params.id)
            .populate("gig", "title")
            .populate("raisedBy", "name email fcmToken")
            .populate("against", "name email fcmToken");

        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: "Dispute not found"
            });
        }

        const isRaisedBy = dispute.raisedBy._id.toString() === req.user._id.toString();
        const isAgainst = dispute.against._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isRaisedBy && !isAgainst && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to update this dispute"
            });
        }

        const { status, resolution } = req.body;

        if (status) {
            if (!["open", "under_review", "resolved", "rejected"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid dispute status value"
                });
            }
            dispute.status = status;
        }

        if (resolution) {
            dispute.resolution = resolution;
            dispute.resolvedBy = req.user._id;
        }

        await dispute.save();

        // Notify both parties when resolved or updated
        const notifyTarget = isRaisedBy ? dispute.against : dispute.raisedBy;
        await sendNotification({
            userId: notifyTarget._id.toString(),
            fcmToken: notifyTarget.fcmToken,
            title: `Dispute Status Updated: ${dispute.status}`,
            body: `Dispute on '${dispute.gig.title}' has been updated to '${dispute.status}'.`,
            type: "DISPUTE_UPDATED",
            payload: { disputeId: dispute._id.toString() }
        });

        res.status(200).json({
            success: true,
            message: "Dispute updated successfully",
            data: { dispute }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDispute,
    getDisputes,
    updateDispute
};

// Controller → contains the business logic for disputes.
// req.body → receives dispute data.
// req.query → receives filters like status.
// req.params.id → gets dispute ID from URL.
// populate() → replaces referenced IDs with actual MongoDB documents.
// $or → allows either raisedBy OR against.
// save() → saves modified document.
// FCM notification → informs the other participant about dispute changes.
// Authorization → only dispute participants/admin can modify disputes.
// Status codes → 201 created, 200 success, 400 invalid input, 403 unauthorized, 404 not found.
// 🎯 One-line viva answer

// disputeController.js manages the complete dispute lifecycle—from raising and viewing disputes to updating their status/resolution and notifying the involved users.