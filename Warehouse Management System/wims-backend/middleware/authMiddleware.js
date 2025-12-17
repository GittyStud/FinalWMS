const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware to check for and verify a JWT from the Authorization header (Bearer <token>).
 */
const protect = (req, res, next) => {
    let token;

    // 1. Check if token exists and is in the correct 'Bearer <token>' format
    if (
        !req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer")
    ) {
        // No token provided or malformed header
        return res
            .status(401)
            .json({ success: false, message: "Not authorized, no token provided." });
    }

    try {
        // Extract the token part (Bearer <token>)
        token = req.headers.authorization.split(" ")[1];

        // Handle case where the token string is empty after split
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Not authorized, malformed token." });
        }

        // 2. Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Attach the decoded user payload (id, role, etc.) to the request object
        req.user = decoded;

        // Proceed to the next middleware or the controller function
        next();

    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        // Token is invalid, expired, or tampered with
        return res
            .status(401)
            .json({
                success: false,
                message: "Not authorized, invalid or expired token.",
            });
    }
};

/**
 * Middleware factory to restrict access based on user role.
 * Must be used immediately after the `protect` middleware.
 * @param {Array<string>} roles - An array of allowed roles (e.g., ['admin', 'manager']).
 */
const authorize = (roles) => (req, res, next) => {
    // Ensure req.user exists (protect middleware must have run successfully)
    if (!req.user || !req.user.role) {
        return res
            .status(500) // Indicates server configuration/execution error
            .json({
                success: false,
                message: "Authorization check failed: User information is missing.",
            });
    }

    // Check if the user's role is included in the allowed roles array
    if (!roles.includes(req.user.role)) {
        return res
            .status(403) // Forbidden
            .json({
                success: false,
                message: `Access denied. Requires one of the following roles: ${roles.join(", ")}`,
            });
    }

    next();
};

module.exports = { protect, authorize };