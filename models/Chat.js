const mongoose = require("mongoose");

/**
 * Message Sub-Schema
 */
const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: [true, "Message content is required"],
            trim: true
        },
        read: {
            type: Boolean,
            default: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

/**
 * Chat Schema
 * Represents a conversation between participants (Client and Freelancer).
 * Can be linked to a specific Gig or directly between users.
 */
const chatSchema = new mongoose.Schema(
    {
        gig: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gig"
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],
        messages: [messageSchema],
        lastMessage: {
            content: { type: String, default: "" },
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            timestamp: { type: Date, default: Date.now }
        }
    },
    {
        timestamps: true
    }
);

chatSchema.index({ participants: 1 });
chatSchema.index({ gig: 1 });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
