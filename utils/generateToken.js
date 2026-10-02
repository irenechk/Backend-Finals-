const jwt = require("jsonwebtoken");

/**
 * Generate a JSON Web Token for authenticated users.
 * @param {string} userId - MongoDB ObjectId of user
 * @param {string} role - 'client', 'freelancer', or 'admin'
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role) => {
    const secret = process.env.JWT_SECRET || "gighub_jwt_fallback_secret_college_project";
    return jwt.sign(
        {
            userId,
            role
        },
        secret,
        {
            expiresIn: "7d"
        }
    );
};

module.exports = generateToken;
