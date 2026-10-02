const mongoose = require("mongoose");

/**
 * User Schema
 * Represents both Clients and Freelancers in the GigHub platform.
 * Supports role-based access control and optional Firebase Cloud Messaging (FCM) tokens.
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"]
        },
        role: {
            type: String,
            enum: {
                values: ["client", "freelancer", "admin"],
                message: "Role must be either client, freelancer, or admin"
            },
            default: "client"
        },
        bio: {
            type: String,
            default: "",
            trim: true
        },
        skills: {
            type: [String],
            default: []
        },
        title: {
            type: String,
            default: "Specialist Freelancer",
            trim: true
        },
        category: {
            type: String,
            default: "Development & IT",
            trim: true
        },
        experience: {
            type: String,
            default: "3+ years",
            trim: true
        },
        location: {
            type: String,
            default: "Remote",
            trim: true
        },
        hourlyRate: {
            type: Number,
            default: 45,
            min: 0
        },
        rating: {
            type: Number,
            default: 4.9,
            min: 0,
            max: 5
        },
        reviewsCount: {
            type: Number,
            default: 8,
            min: 0
        },
        profileImage: {
            type: String,
            default: ""
        },
        completedProjects: {
            type: Number,
            default: 0
        },
        portfolio: [
            {
                title: { type: String, trim: true },
                description: { type: String, trim: true },
                link: { type: String, trim: true },
                imageUrl: { type: String, trim: true }
            }
        ],
        fcmToken: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Method to return user representation without sensitive fields like password
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;