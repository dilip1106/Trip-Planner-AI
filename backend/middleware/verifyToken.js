import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyToken = async (req, res, next) => {
	const token = req.cookies.token;
	if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });

		const user = await User.findById(decoded.userId).select("-password");

		req.userId = decoded.userId;
		next();
	} catch (error) {
		console.log("Error in verifyToken ", error);
		return res.status(500).json({ success: false, message: "Server error" });
	}
};


export const authenticateUser = async (req, res, next) => {
    const token = req.cookies.token; // Get the token from cookies or headers

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        req.userId = decoded.id; // Assuming the token contains the user ID as 'id'
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(403).json({ message: "Invalid token" });
    }
};