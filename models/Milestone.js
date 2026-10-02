const mongoose = require("mongoose");

/**
 * Milestone Schema
 * Tracks deliverables and simulated Escrow payment status for an active project.
 */
const milestoneSchema = new mongoose.Schema(
    {
        gig: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gig",
            required: [true, "Gig reference is required"]
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Client reference is required"]
        },
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Freelancer reference is required"]
        },
        title: {
            type: String,
            required: [true, "Milestone title is required"],
            trim: true
        },
        description: {
            type: String,
            default: "",
            trim: true
        },
        amount: {
            type: Number,
            required: [true, "Milestone amount is required"],
            min: [1, "Amount must be greater than 0"]
        },
        dueDate: {
            type: Date
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "in_progress", "submitted", "approved", "completed", "disputed"],
                message: "Status must be pending, in_progress, submitted, approved, completed, or disputed"
            },
            default: "pending"
        },
        escrowStatus: {
            type: String,
            enum: {
                values: ["not_funded", "funded", "released", "refunded"],
                message: "Escrow status must be not_funded, funded, released, or refunded"
            },
            default: "not_funded"
        },
        submissionNotes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

milestoneSchema.index({ gig: 1, client: 1, freelancer: 1 });

const Milestone = mongoose.model("Milestone", milestoneSchema);

module.exports = Milestone;
