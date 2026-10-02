const mongoose = require("mongoose");

/**
 * Dispute Schema
 * Manages conflicts raised by either a Client or Freelancer on an active Gig.
 */
const disputeSchema = new mongoose.Schema(
    {
        gig: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gig",
            required: [true, "Gig reference is required"]
        },
        raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Dispute creator reference is required"]
        },
        against: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Counterparty reference is required"]
        },
        reason: {
            type: String,
            required: [true, "Reason for dispute is required"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Detailed dispute description is required"],
            trim: true
        },
        status: {
            type: String,
            enum: {
                values: ["open", "under_review", "resolved", "rejected"],
                message: "Status must be open, under_review, resolved, or rejected"
            },
            default: "open"
        },
        resolution: {
            type: String,
            default: ""
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

disputeSchema.index({ gig: 1, raisedBy: 1 });

const Dispute = mongoose.model("Dispute", disputeSchema);

module.exports = Dispute;
