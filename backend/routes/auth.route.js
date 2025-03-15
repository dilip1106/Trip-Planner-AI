// import express from "express";
// import { signup,login,logout,resetPassword, checkAuth, verifyEmail, forgotPassword,fetchAllUsers, saveTime} from "../controllers/auth.controller.js";
// import { authenticateUser, verifyToken } from "../middleware/verifyToken.js";

// const router = express.Router();

// router.get("/check-auth",verifyToken,checkAuth)


// router.post("/signup",signup);
// router.post("/login",login);
// router.post("/logout", verifyToken,logout);

// router.post("/verify-email",verifyEmail);
// router.post("/forgot-password",forgotPassword);

// router.post("/reset-password/:token", resetPassword);

// router.get("/student",fetchAllUsers)
// router.post("/savetime",verifyToken,saveTime);
// export default router;
// Backend routeimport express from 'express';
import User from '../models/user.model.js';
import express from 'express';
const router = express.Router();

// API endpoint to save user data after authentication
router.post('/save-user', async (req, res) => {
  try {
    const userData = req.body;

    if (!userData.clerkUserId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    // Check if user already exists in your database
    const existingUser = await User.findOne({ userId: userData.clerkUserId });
    
    let user;
    if (existingUser) {
      // Update user if already exists
      user = await User.findOneAndUpdate(
        { userId: userData.clerkUserId },
        {
          firstName: userData.firstName || existingUser.firstName,
          lastName: userData.lastName || existingUser.lastName,
          email: userData.email || existingUser.email,
          username: userData.username || existingUser.username,
          imageUrl: userData.imageUrl || existingUser.imageUrl
        },
        { new: true }
      );
    } else {
      // Create new user
      const newUser = new User({
        userId: userData.clerkUserId,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email,
        username: userData.username || '',
        imageUrl: userData.imageUrl || ''
      });
      user = await newUser.save();
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;