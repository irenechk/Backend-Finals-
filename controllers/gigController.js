const Gig = require("../models/Gig");
const { broadcastNotification } = require("../utils/notifications");

/**
 * @desc    Get all gigs with filtering and search
 * @route   GET /api/gigs
 * @access  Public
 */
const getGigs = async (req, res, next) => {
    try {
        const { category, status, search, minBudget, maxBudget } = req.query;
        const query = {};

        // Filter by category
        if (category) {
            query.category = { $regex: new RegExp(`^${category}$`, "i") };
        }

        // Filter by status (default shows 'open' unless specified or requesting 'all')
        if (status && status !== "all") {
            query.status = status;
        }

        // Filter by budget range
        if (minBudget || maxBudget) {
            query.budget = {};
            if (minBudget) query.budget.$gte = Number(minBudget);
            if (maxBudget) query.budget.$lte = Number(maxBudget);
        }

        // Text search across title and description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const gigs = await Gig.find(query)
            .populate("client", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: gigs.length,
            message: "Gigs retrieved successfully",
            data: { gigs }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single gig by ID
 * @route   GET /api/gigs/:id
 * @access  Public
 */
const getGigById = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.id).populate("client", "name email role bio");

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Gig details retrieved successfully",
            data: { gig }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new gig (Client only)
 * @route   POST /api/gigs
 * @access  Private (Client only)
 */
const createGig = async (req, res, next) => {
    try {
        const { title, description, budget, category, skills, deadline } = req.body;

        const gig = await Gig.create({
            title,
            description,
            budget: Number(budget),
            category,
            skills: skills || [],
            deadline: deadline || null,
            client: req.user._id,
            status: "open"
        });

        // Broadcast notification to freelancers room
        broadcastNotification({
            room: "freelancers",
            title: "New Gig Posted!",
            body: `${gig.title} ($${gig.budget})`,
            type: "NEW_GIG",
            payload: { gigId: gig._id, title: gig.title, budget: gig.budget }
        });

        res.status(201).json({
            success: true,
            message: "Gig created successfully",
            data: { gig }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a gig (Gig owner or Admin only)
 * @route   PUT /api/gigs/:id
 * @access  Private
 */
const updateGig = async (req, res, next) => {
    try {
        let gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found"
            });
        }

        // Authorization check: only gig client or admin can update
        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to update this gig"
            });
        }

        const allowedUpdates = ["title", "description", "budget", "category", "skills", "deadline", "status"];
        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                gig[field] = req.body[field];
            }
        });

        await gig.save();

        res.status(200).json({
            success: true,
            message: "Gig updated successfully",
            data: { gig }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a gig (Gig owner or Admin only)
 * @route   DELETE /api/gigs/:id
 * @access  Private
 */
const deleteGig = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found"
            });
        }

        // Authorization check: only gig client or admin can delete
        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to delete this gig"
            });
        }

        await Gig.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Gig deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getGigs,
    getGigById,
    createGig,
    updateGig,
    deleteGig
};


// req.query	Filters/search parameters
// req.params	ID from URL
// req.body	Data sent by frontend
// find()	Finds multiple documents
// findById()	Finds one document by ID
// findByIdAndDelete()	Deletes a document
// populate()	Gets referenced document information
// $regex	Pattern/text searching
// $or	Either condition can match
// $gte	Greater than/equal
// $lte	Less than/equal
// sort({createdAt:-1})	Newest first
// broadcastNotification()	Sends notification to a group
// 🎤 One-line viva answer

// gigController.js manages the complete gig lifecycle—searching, filtering, creating, viewing, updating, and deleting gigs, with authorization and freelancer notifications.