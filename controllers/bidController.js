const Bid = require("../models/Bid");
const Gig = require("../models/Gig");
const User = require("../models/User");
const { sendNotification } = require("../utils/notifications");

/**
 * @desc    Submit a new bid on a gig
 * @route   POST /api/bids
 * @access  Private (Freelancers only)
 */
const createBid = async (req, res, next) => {
    try {
        const { gig: gigId, amount, proposal, deliveryTime } = req.body;

        // Check if gig exists
        const gig = await Gig.findById(gigId).populate("client");
        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found"
            });
        }

        // Cannot bid on closed/in_progress gig
        if (gig.status !== "open") {
            return res.status(400).json({
                success: false,
                message: `Cannot bid on gig with status '${gig.status}'. Gig must be open.`
            });
        }

        // Client cannot bid on own gig
        if (gig.client._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot bid on your own gig"
            });
        }

        // Check if freelancer already submitted a bid for this gig
        const existingBid = await Bid.findOne({
            gig: gigId,
            freelancer: req.user._id
        });

        if (existingBid) {
            return res.status(409).json({
                success: false,
                message: "You have already submitted a bid for this gig"
            });
        }

        const bid = await Bid.create({
            gig: gigId,
            freelancer: req.user._id,
            amount: Number(amount),
            proposal,
            deliveryTime: Number(deliveryTime),
            status: "pending"
        });

        // Populate details for response and notifications
        await bid.populate([
            { path: "gig", select: "title client" },
            { path: "freelancer", select: "name email skills" }
        ]);

        // Send notification to the gig owner (Client)
        await sendNotification({
            userId: gig.client._id.toString(),
            fcmToken: gig.client.fcmToken,
            title: "New Bid Received",
            body: `${req.user.name} submitted a bid of $${amount} on '${gig.title}'`,
            type: "NEW_BID",
            payload: { bidId: bid._id.toString(), gigId: gig._id.toString() }
        });

        res.status(201).json({
            success: true,
            message: "Bid submitted successfully",
            data: { bid }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get bids (filtered by gig or current user)
 * @route   GET /api/bids
 * @access  Private
 */
const getBids = async (req, res, next) => {
    try {
        const { gig: gigId, status } = req.query;
        let query = {};

        if (gigId) {
            // Verify access: user must be gig owner or bidding freelancer or admin
            const gig = await Gig.findById(gigId);
            if (!gig) {
                return res.status(404).json({
                    success: false,
                    message: "Gig not found"
                });
            }

            query.gig = gigId;

            // If requester is not the gig owner or admin, restrict to their own bid
            if (gig.client.toString() !== req.user._id.toString() && req.user.role !== "admin") {
                query.freelancer = req.user._id;
            }
        } else {
            // If no gig param provided, default to user's perspective
            if (req.user.role === "freelancer") {
                query.freelancer = req.user._id;
            } else if (req.user.role === "client") {
                // Find all gigs owned by client
                const myGigs = await Gig.find({ client: req.user._id }).select("_id");
                const gigIds = myGigs.map((g) => g._id);
                query.gig = { $in: gigIds };
            }
        }

        if (status) {
            query.status = status;
        }

        const bids = await Bid.find(query)
            .populate("gig", "title budget status client")
            .populate("freelancer", "name email skills bio")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bids.length,
            message: "Bids retrieved successfully",
            data: { bids }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single bid by ID
 * @route   GET /api/bids/:id
 * @access  Private
 */
const getBidById = async (req, res, next) => {
    try {
        const bid = await Bid.findById(req.params.id)
            .populate("gig", "title budget status client")
            .populate("freelancer", "name email skills bio");

        if (!bid) {
            return res.status(404).json({
                success: false,
                message: "Bid not found"
            });
        }

        // Authorization check: must be freelancer or gig owner or admin
        const isFreelancer = bid.freelancer._id.toString() === req.user._id.toString();
        const isClient = bid.gig.client.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isFreelancer && !isClient && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to view this bid"
            });
        }

        res.status(200).json({
            success: true,
            message: "Bid retrieved successfully",
            data: { bid }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update bid status or details
 * @route   PUT /api/bids/:id
 * @access  Private
 */
const updateBid = async (req, res, next) => {
    try {
        const bid = await Bid.findById(req.params.id)
            .populate("gig")
            .populate("freelancer");

        if (!bid) {
            return res.status(404).json({
                success: false,
                message: "Bid not found"
            });
        }

        const isFreelancer = bid.freelancer._id.toString() === req.user._id.toString();
        const isClient = bid.gig.client.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        const { status, amount, proposal, deliveryTime } = req.body;

        // If freelancer is updating
        if (isFreelancer && !isClient) {
            if (bid.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    message: `Cannot edit bid with status '${bid.status}'`
                });
            }

            if (amount !== undefined) bid.amount = Number(amount);
            if (proposal !== undefined) bid.proposal = proposal;
            if (deliveryTime !== undefined) bid.deliveryTime = Number(deliveryTime);

            // Freelancer can withdraw
            if (status === "withdrawn") {
                bid.status = "withdrawn";
            }

            await bid.save();

            return res.status(200).json({
                success: true,
                message: "Bid updated successfully",
                data: { bid }
            });
        }

        // If client (or admin) is managing/accepting/rejecting
        if (isClient || isAdmin) {
            if (!status || !["accepted", "rejected"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Client can only set status to 'accepted' or 'rejected'"
                });
            }

            bid.status = status;
            await bid.save();

            // If accepted, update the Gig status to 'in_progress'
            if (status === "accepted") {
                await Gig.findByIdAndUpdate(bid.gig._id, { status: "in_progress" });

                // Reject other pending bids on this gig
                await Bid.updateMany(
                    { gig: bid.gig._id, _id: { $ne: bid._id }, status: "pending" },
                    { status: "rejected" }
                );

                // Send notification to the chosen freelancer
                await sendNotification({
                    userId: bid.freelancer._id.toString(),
                    fcmToken: bid.freelancer.fcmToken,
                    title: "Congratulations! Your Bid Was Accepted",
                    body: `Your bid on '${bid.gig.title}' has been accepted by the client.`,
                    type: "BID_ACCEPTED",
                    payload: { bidId: bid._id.toString(), gigId: bid.gig._id.toString() }
                });
            }

            return res.status(200).json({
                success: true,
                message: `Bid ${status} successfully`,
                data: { bid }
            });
        }

        return res.status(403).json({
            success: false,
            message: "Forbidden: Not authorized to update this bid"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBid,
    getBids,
    getBidById,
    updateBid
};


// Bid.create()	Creates a bid
// findById()	Finds a document by ID
// findOne()	Finds one matching document
// findByIdAndUpdate()	Finds and updates a document
// updateMany()	Updates multiple documents
// populate()	Gets related document information
// req.body	Data sent by frontend
// req.query	Filters in URL
// req.params	ID/value from URL
// req.user	Logged-in user
// 403	User isn't authorized
// 404	Resource not found
// 409	Conflict/duplicate
// 201	Successfully created
// 🎯 One-line viva answer

// bidController.js manages the complete bidding process: creating, viewing, updating, accepting, rejecting, and withdrawing bids, while also handling authorization and notifications.