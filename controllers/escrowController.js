const Milestone = require("../models/Milestone");
const { sendNotification } = require("../utils/notifications");

/**
 * Escrow Controller (Simulated Payment Gateway)
 * Simulates a secure third-party escrow service where client funds are held
 * until work is delivered, approved, and released.
 */

/**
 * @desc    Deposit / Lock funds into simulated Escrow for a milestone
 * @route   POST /api/escrow/fund/:milestoneId
 * @access  Private (Client or Admin)
 */
const fundEscrow = async (req, res, next) => {
    try {
        const milestone = await Milestone.findById(req.params.milestoneId)
            .populate("gig", "title")
            .populate("freelancer", "name email fcmToken");

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        if (milestone.client.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only the client can fund this milestone escrow"
            });
        }

        if (milestone.escrowStatus === "funded") {
            return res.status(400).json({
                success: false,
                message: "Escrow is already funded for this milestone"
            });
        }

        milestone.escrowStatus = "funded";
        milestone.status = "in_progress";
        await milestone.save();

        await sendNotification({
            userId: milestone.freelancer._id.toString(),
            fcmToken: milestone.freelancer.fcmToken,
            title: "Escrow Deposit Confirmed",
            body: `Client deposited $${milestone.amount} into escrow for '${milestone.title}'. You may safely begin work.`,
            type: "ESCROW_FUNDED",
            payload: { milestoneId: milestone._id.toString() }
        });

        res.status(200).json({
            success: true,
            message: `Successfully deposited $${milestone.amount} into Escrow (Simulation)`,
            data: {
                milestoneId: milestone._id,
                amount: milestone.amount,
                escrowStatus: milestone.escrowStatus,
                projectStatus: milestone.status
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Release Escrow funds to the Freelancer
 * @route   POST /api/escrow/release/:milestoneId
 * @access  Private (Client or Admin)
 */
const releaseEscrow = async (req, res, next) => {
    try {
        const milestone = await Milestone.findById(req.params.milestoneId)
            .populate("gig", "title")
            .populate("freelancer", "name email fcmToken");

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        if (milestone.client.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only the client can release escrow funds"
            });
        }

        if (milestone.escrowStatus !== "funded") {
            return res.status(400).json({
                success: false,
                message: `Cannot release escrow. Current escrow status is '${milestone.escrowStatus}' (must be 'funded')`
            });
        }

        milestone.escrowStatus = "released";
        milestone.status = "completed";
        await milestone.save();

        await sendNotification({
            userId: milestone.freelancer._id.toString(),
            fcmToken: milestone.freelancer.fcmToken,
            title: "Payment Released!",
            body: `$${milestone.amount} has been successfully paid out from escrow for '${milestone.title}'.`,
            type: "ESCROW_RELEASED",
            payload: { milestoneId: milestone._id.toString() }
        });

        res.status(200).json({
            success: true,
            message: `Successfully released $${milestone.amount} from Escrow to Freelancer (Simulation)`,
            data: {
                milestoneId: milestone._id,
                amount: milestone.amount,
                escrowStatus: milestone.escrowStatus,
                projectStatus: milestone.status
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Refund Escrow funds back to the Client (Dispute resolution / cancellation)
 * @route   POST /api/escrow/refund/:milestoneId
 * @access  Private (Client or Admin)
 */
const refundEscrow = async (req, res, next) => {
    try {
        const milestone = await Milestone.findById(req.params.milestoneId)
            .populate("gig", "title")
            .populate("client", "name email fcmToken");

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        if (milestone.client.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only client or admin can trigger an escrow refund"
            });
        }

        if (milestone.escrowStatus !== "funded") {
            return res.status(400).json({
                success: false,
                message: `Cannot refund escrow. Current status is '${milestone.escrowStatus}'`
            });
        }

        milestone.escrowStatus = "refunded";
        milestone.status = "disputed";
        await milestone.save();

        res.status(200).json({
            success: true,
            message: `Successfully refunded $${milestone.amount} back to Client (Simulation)`,
            data: {
                milestoneId: milestone._id,
                amount: milestone.amount,
                escrowStatus: milestone.escrowStatus
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current Escrow status for a milestone
 * @route   GET /api/escrow/status/:milestoneId
 * @access  Private
 */
const getEscrowStatus = async (req, res, next) => {
    try {
        const milestone = await Milestone.findById(req.params.milestoneId)
            .populate("gig", "title")
            .populate("client", "name email")
            .populate("freelancer", "name email");

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Escrow status retrieved successfully",
            data: {
                milestoneId: milestone._id,
                title: milestone.title,
                amount: milestone.amount,
                escrowStatus: milestone.escrowStatus,
                status: milestone.status,
                client: milestone.client,
                freelancer: milestone.freelancer
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    fundEscrow,
    releaseEscrow,
    refundEscrow,
    getEscrowStatus
};


// What is escrow?

// Escrow temporarily holds the client's payment until the agreed work is completed.

// Why is escrow used?

// It provides payment protection for both sides by preventing immediate transfer before the work is completed.

// Is this real payment?

// No. This project uses a simulated escrow/payment gateway. It changes database statuses but does not transfer real money.

// Why use req.params.milestoneId?

// It gets the milestone ID directly from the URL.

// Why use populate()?

// To retrieve related information such as the gig, client, and freelancer instead of only their MongoDB IDs.

// Why check escrowStatus === "funded" before release/refund?

// To make sure money was actually deposited before trying to release or refund it.

// Why use await milestone.save()?

// To permanently save the new escrow/milestone status in MongoDB.

// 🎤 One-line viva answer

// escrowController.js simulates secure milestone payments by funding, releasing, refunding, and checking escrow status, while controlling authorization and notifying the freelancer about payment changes.