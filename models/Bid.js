const mongoose = require("mongoose");

/**
 * Bid Schema
 * Represents a proposal submitted by a Freelancer on a specific Gig.
 * Enforces one bid per freelancer per gig using a compound unique index.
 */
const bidSchema = new mongoose.Schema(
    {
        gig: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gig",
            required: [true, "Gig reference is required"]
        },
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Freelancer reference is required"]
        },
        amount: {
            type: Number,
            required: [true, "Bid amount is required"],
            min: [1, "Bid amount must be greater than 0"]
        },
        proposal: {
            type: String,
            required: [true, "Proposal letter is required"],
            trim: true
        },
        deliveryTime: {
            type: Number,
            required: [true, "Estimated delivery time (in days) is required"],
            min: [1, "Delivery time must be at least 1 day"]
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "accepted", "rejected", "withdrawn"],
                message: "Bid status must be pending, accepted, rejected, or withdrawn"
            },
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

// Ensure a freelancer cannot bid more than once on the same gig
bidSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

const Bid = mongoose.model("Bid", bidSchema);

module.exports = Bid;
