const Milestone = require("../models/Milestone");
const Gig = require("../models/Gig");
const User = require("../models/User");
const { sendNotification } = require("../utils/notifications");

/**
 * @desc    Create a new project milestone
 * @route   POST /api/milestones
 * @access  Private (Client or Admin)
 */
const createMilestone = async (req, res, next) => {
    try {
        const { gig: gigId, freelancer: freelancerId, title, description, amount, dueDate } = req.body;

        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found"
            });
        }

        // Only gig client or admin can create milestones
        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only the project client can create milestones"
            });
        }

        const freelancer = await User.findById(freelancerId);
        if (!freelancer || freelancer.role !== "freelancer") {
            return res.status(400).json({
                success: false,
                message: "A valid freelancer user must be assigned to this milestone"
            });
        }

        const milestone = await Milestone.create({
            gig: gigId,
            client: req.user._id,
            freelancer: freelancerId,
            title,
            description: description || "",
            amount: Number(amount),
            dueDate: dueDate || null,
            status: "pending",
            escrowStatus: "not_funded"
        });

        // Notify freelancer
        await sendNotification({
            userId: freelancerId,
            fcmToken: freelancer.fcmToken,
            title: "New Milestone Created",
            body: `Milestone '${title}' ($${amount}) was created for project '${gig.title}'`,
            type: "MILESTONE_CREATED",
            payload: { milestoneId: milestone._id.toString(), gigId: gigId }
        });

        res.status(201).json({
            success: true,
            message: "Milestone created successfully",
            data: { milestone }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get milestones for a gig or current user
 * @route   GET /api/milestones
 * @access  Private
 */
const getMilestones = async (req, res, next) => {
    try {
        const { gig: gigId, status, escrowStatus } = req.query;
        let query = {};

        if (gigId) {
            query.gig = gigId;
            // Ensure requester is client, freelancer or admin
            if (req.user.role !== "admin") {
                query.$or = [{ client: req.user._id }, { freelancer: req.user._id }];
            }
        } else {
            if (req.user.role === "client") {
                query.client = req.user._id;
            } else if (req.user.role === "freelancer") {
                query.freelancer = req.user._id;
            }
        }

        if (status) query.status = status;
        if (escrowStatus) query.escrowStatus = escrowStatus;

        const milestones = await Milestone.find(query)
            .populate("gig", "title budget status")
            .populate("client", "name email")
            .populate("freelancer", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: milestones.length,
            message: "Milestones retrieved successfully",
            data: { milestones }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update milestone status and simulated escrow transitions
 * @route   PUT /api/milestones/:id
 * @access  Private (Project participants only)
 */
const updateMilestone = async (req, res, next) => {
    try {
        const milestone = await Milestone.findById(req.params.id)
            .populate("gig", "title")
            .populate("client", "name email fcmToken")
            .populate("freelancer", "name email fcmToken");

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        const isClient = milestone.client._id.toString() === req.user._id.toString();
        const isFreelancer = milestone.freelancer._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isClient && !isFreelancer && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not a participant of this milestone"
            });
        }

        const { status, escrowStatus, submissionNotes, title, description, amount, dueDate } = req.body;

        // Freelancer actions: submit deliverable
        if (isFreelancer && !isClient && !isAdmin) {
            if (status === "submitted") {
                milestone.status = "submitted";
                if (submissionNotes) milestone.submissionNotes = submissionNotes;

                await milestone.save();

                // Notify client
                await sendNotification({
                    userId: milestone.client._id.toString(),
                    fcmToken: milestone.client.fcmToken,
                    title: "Milestone Submitted for Review",
                    body: `${req.user.name} submitted work for milestone '${milestone.title}'`,
                    type: "MILESTONE_SUBMITTED",
                    payload: { milestoneId: milestone._id.toString() }
                });

                return res.status(200).json({
                    success: true,
                    message: "Milestone submitted for review successfully",
                    data: { milestone }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Freelancers can only update status to 'submitted'"
                });
            }
        }

        // Client and Admin actions: fund escrow, approve, release escrow, refund, or edit details
        if (isClient || isAdmin) {
            if (title) milestone.title = title;
            if (description !== undefined) milestone.description = description;
            if (amount) milestone.amount = Number(amount);
            if (dueDate) milestone.dueDate = dueDate;

            // Simulated Escrow Funding
            if (escrowStatus === "funded") {
                milestone.escrowStatus = "funded";
                milestone.status = "in_progress";

                await milestone.save();

                await sendNotification({
                    userId: milestone.freelancer._id.toString(),
                    fcmToken: milestone.freelancer.fcmToken,
                    title: "Escrow Funded!",
                    body: `The client deposited $${milestone.amount} into escrow for milestone '${milestone.title}'. You can now begin work.`,
                    type: "ESCROW_FUNDED",
                    payload: { milestoneId: milestone._id.toString() }
                });

                return res.status(200).json({
                    success: true,
                    message: "Escrow funds locked successfully (simulation)",
                    data: { milestone }
                });
            }

            // Simulated Escrow Release
            if (escrowStatus === "released" || status === "completed" || status === "approved") {
                if (status) milestone.status = status;
                if (escrowStatus === "released") {
                    milestone.escrowStatus = "released";
                    milestone.status = "completed";
                }

                await milestone.save();

                await sendNotification({
                    userId: milestone.freelancer._id.toString(),
                    fcmToken: milestone.freelancer.fcmToken,
                    title: "Escrow Payment Released!",
                    body: `$${milestone.amount} has been released for milestone '${milestone.title}'.`,
                    type: "ESCROW_RELEASED",
                    payload: { milestoneId: milestone._id.toString() }
                });

                return res.status(200).json({
                    success: true,
                    message: "Milestone approved and escrow funds released (simulation)",
                    data: { milestone }
                });
            }

            // Escrow refund
            if (escrowStatus === "refunded") {
                milestone.escrowStatus = "refunded";
                milestone.status = "disputed";
                await milestone.save();

                return res.status(200).json({
                    success: true,
                    message: "Escrow refunded (simulation)",
                    data: { milestone }
                });
            }

            if (status) milestone.status = status;
            await milestone.save();

            return res.status(200).json({
                success: true,
                message: "Milestone updated successfully",
                data: { milestone }
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createMilestone,
    getMilestones,
    updateMilestone
};


// Milestone	A smaller stage/part of a project
// req.body	Data sent by frontend
// req.query	Filtering parameters
// req.params.id	Milestone ID from URL
// populate()	Gets related MongoDB documents
// Number(amount)	Converts amount to a number
// `	
// `	
// $or	Either condition can match
// save()	Saves changes to MongoDB
// isClient/isFreelancer/isAdmin	Role/authorization checks
// 🎤 One-line viva answer

// milestoneController.js manages project milestones from creation and retrieval to freelancer submission, client approval, and simulated escrow funding, release, and refund.