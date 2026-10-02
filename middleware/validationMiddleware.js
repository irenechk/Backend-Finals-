const mongoose = require("mongoose");

/**
 * Helper to validate MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Middleware to validate URL route param :id as a valid MongoDB ObjectId
 */
const validateObjectId = (paramName = "id") => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ID format for parameter '${paramName}'`,
                error: `Provided value '${id}' is not a valid 24-character hexadecimal MongoDB ObjectId`
            });
        }
        next();
    };
};

/**
 * Validate Registration Body
 */
const validateRegister = (req, res, next) => {
    const { name, email, password, role } = req.body;
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        errors.push("Name is required and must be a non-empty string");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
        errors.push("A valid email address is required");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        errors.push("Password is required and must be at least 6 characters long");
    }

    if (role && !["client", "freelancer", "admin"].includes(role)) {
        errors.push("Role must be either 'client', 'freelancer', or 'admin'");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed for registration input",
            errors
        });
    }

    next();
};

/**
 * Validate Login Body
 */
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
        errors.push("A valid email address is required");
    }

    if (!password || typeof password !== "string") {
        errors.push("Password is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed for login input",
            errors
        });
    }

    next();
};

/**
 * Validate Gig Creation Body
 */
const validateGigCreate = (req, res, next) => {
    const { title, description, budget, category, skills, deadline } = req.body;
    const errors = [];

    if (!title || typeof title !== "string" || title.trim().length === 0) {
        errors.push("Gig title is required");
    } else if (title.trim().length > 120) {
        errors.push("Gig title cannot exceed 120 characters");
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
        errors.push("Gig description is required");
    }

    if (budget === undefined || budget === null || isNaN(Number(budget)) || Number(budget) <= 0) {
        errors.push("Budget must be a positive number greater than 0");
    }

    if (!category || typeof category !== "string" || category.trim().length === 0) {
        errors.push("Category is required");
    }

    if (skills && !Array.isArray(skills)) {
        errors.push("Skills must be an array of strings");
    }

    if (deadline && isNaN(Date.parse(deadline))) {
        errors.push("Deadline must be a valid ISO date string");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed for gig creation",
            errors
        });
    }

    next();
};

/**
 * Validate Bid Creation Body
 */
const validateBidCreate = (req, res, next) => {
    const { gig, amount, proposal, deliveryTime } = req.body;
    const errors = [];

    if (!gig || !isValidObjectId(gig)) {
        errors.push("A valid Gig ObjectId is required");
    }

    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
        errors.push("Bid amount must be a positive number greater than 0");
    }

    if (!proposal || typeof proposal !== "string" || proposal.trim().length === 0) {
        errors.push("Proposal text is required");
    }

    if (deliveryTime === undefined || deliveryTime === null || isNaN(Number(deliveryTime)) || Number(deliveryTime) <= 0) {
        errors.push("Estimated delivery time must be a positive number of days (at least 1)");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed for bid creation",
            errors
        });
    }

    next();
};

/**
 * Validate Milestone Creation Body
 */
const validateMilestoneCreate = (req, res, next) => {
    const { gig, freelancer, title, amount, dueDate } = req.body;
    const errors = [];

    if (!gig || !isValidObjectId(gig)) {
        errors.push("A valid Gig ObjectId is required");
    }

    if (!freelancer || !isValidObjectId(freelancer)) {
        errors.push("A valid Freelancer User ObjectId is required");
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
        errors.push("Milestone title is required");
    }

    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
        errors.push("Milestone amount must be a positive number greater than 0");
    }

    if (dueDate && isNaN(Date.parse(dueDate))) {
        errors.push("Due date must be a valid date string");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed for milestone creation",
            errors
        });
    }

    next();
};

/**
 * Validate Dispute Creation Body
 */
const validateDisputeCreate = (req, res, next) => {
    const { gig, against, reason, description } = req.body;
    const errors = [];

    if (!gig || !isValidObjectId(gig)) {
        errors.push("A valid Gig ObjectId is required");
    }

    if (!against || !isValidObjectId(against)) {
        errors.push("A valid counterparty User ObjectId is required");
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
        errors.push("Dispute reason is required");
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
        errors.push("Dispute description is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed for dispute creation",
            errors
        });
    }

    next();
};

module.exports = {
    isValidObjectId,
    validateObjectId,
    validateRegister,
    validateLogin,
    validateGigCreate,
    validateBidCreate,
    validateMilestoneCreate,
    validateDisputeCreate
};

// Validation Middleware	Checks input before controller
// req.body	Data sent in request body
// req.params	Data from URL parameters
// ObjectId	MongoDB document ID format
// Regex	Pattern used to validate text
// Array.isArray()	Checks whether value is an array
// isNaN()	Checks whether a value is not a valid number
// Date.parse()	Checks/parses date strings
// errors.push()	Adds validation error
// next()	Sends valid request to next middleware
// 400	Bad Request
// 🎤 One-line viva answer

// “validationMiddleware checks request data such as IDs, registration details, gigs, bids, milestones, and disputes before they reach the controller, and returns 400 errors when the input is invalid.”