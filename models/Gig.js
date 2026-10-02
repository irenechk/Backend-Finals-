const mongoose = require("mongoose");

/**
 * Gig Schema
 * Represents a freelance project posted by a Client.
 * Tracks gig details, budget, required skills, and current project lifecycle status.
 */
const gigSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Gig title is required"],
            trim: true,
            maxlength: [120, "Title cannot exceed 120 characters"]
        },
        description: {
            type: String,
            required: [true, "Gig description is required"],
            trim: true
        },
        budget: {
            type: Number,
            required: [true, "Budget is required"],
            min: [1, "Budget must be greater than 0"]
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true
        },
        skills: {
            type: [String],
            default: []
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Client reference is required"]
        },
        status: {
            type: String,
            enum: {
                values: ["open", "in_progress", "completed", "cancelled"],
                message: "Status must be open, in_progress, completed, or cancelled"
            },
            default: "open"
        },
        deadline: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Indexes for common queries (filtering by category, status, and text search)
gigSchema.index({ category: 1, status: 1 });
gigSchema.index({ title: "text", description: "text" });

const Gig = mongoose.model("Gig", gigSchema);

module.exports = Gig;
