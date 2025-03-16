import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// This middleware will handle the authentication for you
const clerkMiddleware = ClerkExpressRequireAuth();

// Custom middleware to format the user object
export const requireAuth = (req, res, next) => {
  // Use Clerk's middleware first
  clerkMiddleware(req, res, (err) => {
    if (err) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    // If authentication is successful, Clerk adds auth property to the request
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ success: false, error: 'Invalid authentication' });
    }
    
    // Add the user ID to our custom format
    req.user = {
      clerkId: req.auth.userId
    };
    
    next();
  });
};