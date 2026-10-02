/**
 * Role-Based Authorization Middleware
 * Restricts endpoint access to users possessing specific roles.
 * Must be placed after `protect` auth middleware.
 * 
 * @param  {...string} roles - Allowed roles (e.g. 'client', 'freelancer', 'admin')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required before role verification"
            });
        }

        // Allow explicitly listed roles or system administrators
        if (!roles.includes(req.user.role) && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource`
            });
        }

        next();
    };
};

module.exports = {
    authorize
};

// Authentication	Verifies who the user is
// Authorization	Verifies what the user can access
// authorize()	Checks user's role
// ...roles	Allows multiple roles
// includes()	Checks whether role is allowed
// req.user.role	Current user's role
// 401	Authentication required/failed
// 403	Authenticated but not permitted
// next()	Continue to controller
// admin	Automatically allowed in this middleware
// 🎤 One-line viva answer

// “roleMiddleware provides role-based authorization by checking the authenticated user's role from req.user and allowing or denying access to specific routes.”