// backend/middleware/auth.middleware.js
import User from '../models/user.model.js'; // Import your User model

/**
 * Authentication middleware that verifies user data sent from the frontend
 * against your own database records without using Clerk SDK
 */
export const authenticateUser = async (req, res, next) => {
  try {
    // Check if userData exists in the request body
    const { userData } = req.body;
    if (!userData || !userData.clerkId) {
      return res.status(401).json({ error: 'User data not provided' });
    }

    try {
      // Find the user in your database using the clerkId
      const user = await User.findOne({ clerkId: userData.clerkId });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Optional: Additional verification to ensure the data matches
      if (user.email !== userData.email) {
        return res.status(401).json({ error: 'User data mismatch' });
      }
      
      // Add verified user info to the request object from your database
      req.user = {
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        image: user.image
      };
      
      // Remove userData from body to prevent it from being passed to controllers
      const { userData: _, ...cleanBody } = req.body;
      req.body = cleanBody;
      
      next();
    } catch (error) {
      console.error('User verification error:', error);
      return res.status(401).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};