/**
 * 404 Route Not Found Middleware
 */
const notFound = (req, res, next) => {
    const error = new Error(`Resource not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Centralized Error Handling Middleware
 * Catches all errors and returns standard JSON responses with appropriate HTTP status codes.
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error";
    let details = null;

    // Handle Mongoose Bad ObjectId (CastError)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Resource not found with invalid ID: ${err.value}`;
    }

    // Handle Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
        details = Object.values(err.errors).map((val) => val.message);
    }

    // Handle Mongoose Duplicate Key Error (Code 11000)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value entered for '${field}'. This value already exists.`;
    }

    // Handle JWT Errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid JSON Web Token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "JSON Web Token has expired";
    }

    res.status(statusCode).json({
        success: false,
        message,
        error: details || message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });
};

module.exports = {
    notFound,
    errorHandler
};
// notFound	Handles non-existing routes
// errorHandler	Centralized error handling
// next(error)	Passes error to error middleware
// 400	Bad Request
// 401	Unauthorized
// 404	Resource/route not found
// 409	Conflict, usually duplicate data
// 500	Internal Server Error
// CastError	Invalid MongoDB ID
// ValidationError	Data doesn't satisfy schema
// 11000	MongoDB duplicate-key error
// JsonWebTokenError	Invalid JWT
// TokenExpiredError	Expired JWT
// 🎤 One-line viva answer

// “errorMiddleware provides centralized error handling by detecting 404, MongoDB, validation, duplicate-key, and JWT errors and returning consistent JSON responses with appropriate HTTP status codes.”