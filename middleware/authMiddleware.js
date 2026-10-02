const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * JWT Authentication Middleware
 * Protects private routes by validating the Bearer token in the Authorization header.
 * Attaches the authenticated user object to `req.user`.
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Extract token from "Bearer <token>"
            token = req.headers.authorization.split(" ")[1];

            // Verify token signature
            const secret = process.env.JWT_SECRET || "gighub_jwt_fallback_secret_college_project";
            const decoded = jwt.verify(token, secret);

            // Fetch user from DB excluding password
            const user = await User.findById(decoded.userId).select("-password");

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found or account no longer active"
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error("JWT Authentication error:", error.message);
            return res.status(401).json({
                success: false,
                message: "Not authorized, token failed or expired",
                error: error.message
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no Bearer token provided"
        });
    }
};

module.exports = {
    protect
};
// JWT	Token used for authentication
// Bearer Token	JWT sent in Authorization header
// jwt.verify()	Validates the JWT
// req.user	Stores authenticated user's information
// next()	Moves request to next middleware/controller
// 401	Unauthorized
// .select("-password")	Excludes password
// Middleware	Code that runs between request and controller
// 🎤 One-line viva answer

// “authMiddleware protects private routes by verifying the Bearer JWT, finding the user in MongoDB, storing the user in req.user, and allowing the request to continue using next().”