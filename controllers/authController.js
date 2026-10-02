const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

/**
 * @desc    Register a new user (Client or Freelancer)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            role,
            bio,
            skills,
            fcmToken,
            title,
            category,
            experience,
            location,
            hourlyRate
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "A user with this email address already exists"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user document
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || "client",
            bio: bio || "",
            skills: skills || [],
            fcmToken: fcmToken || null,
            title: title || (role === "freelancer" ? "Specialist Freelancer" : ""),
            category: category || "Development & IT",
            experience: experience || "3+ years",
            location: location || "Remote",
            hourlyRate: hourlyRate ? Number(hourlyRate) : 45
        });

        // Generate JWT token
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    bio: user.bio,
                    skills: user.skills,
                    title: user.title,
                    category: user.category,
                    experience: user.experience,
                    location: user.location,
                    hourlyRate: user.hourlyRate,
                    rating: user.rating,
                    reviewsCount: user.reviewsCount,
                    profileImage: user.profileImage,
                    portfolio: user.portfolio
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password, fcmToken } = req.body;

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Verify password with bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Optionally update FCM token on login if provided
        if (fcmToken && fcmToken !== user.fcmToken) {
            user.fcmToken = fcmToken;
            await user.save();
        }

        // Generate JWT token
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    bio: user.bio,
                    skills: user.skills,
                    title: user.title || "Specialist Freelancer",
                    category: user.category || "Development & IT",
                    experience: user.experience || "3+ years",
                    location: user.location || "Remote",
                    hourlyRate: user.hourlyRate || 45,
                    rating: user.rating || 4.9,
                    reviewsCount: user.reviewsCount || 8,
                    profileImage: user.profileImage || "",
                    portfolio: user.portfolio || []
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private (JWT Protected)
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update FCM device token for push notifications
 * @route   PUT /api/auth/fcm-token
 * @access  Private
 */
const updateFcmToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) {
            return res.status(400).json({
                success: false,
                message: "FCM token is required"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { fcmToken },
            { new: true }
        ).select("-password");

        res.status(200).json({
            success: true,
            message: "FCM token updated successfully",
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateFcmToken
};



// Controller	Contains the main logic for an API
// bcrypt	Hashes and verifies passwords
// Salt	Adds randomness to password hashing
// JWT	Token used for authentication
// req.body	Data sent by frontend
// req.user	Authenticated user's information
// User.findOne()	Searches for a user
// User.create()	Creates a user
// findByIdAndUpdate()	Updates a user
// select("-password")	Hides password from result
// FCM token	Identifies a device for Firebase notifications
// next(error)	Sends error to error-handling middleware
// Status codes used
// 201 → User successfully created
// 200 → Request successful
// 400 → Bad request
// 401 → Authentication failed
// 409 → User already exists
// 🎯 One-line viva answer

// authController.js handles registration, login, fetching the authenticated user's profile, and updating the FCM notification token. It uses Mongoose for MongoDB, bcrypt for password security, and JWT for authentication