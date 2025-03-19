
import  User  from "../models/user.model.js";

export const updateUser = async (req, res) => {
  try {
    const {  firstName, lastName } = req.body;
    
    // if (!userData || !userData.clerkId) {
    //   return res.status(401).json({ success: false, error: 'User data not provided' });
    // }

    const {clerkId} = req.user;
    
    // Find the user by clerkId
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Update user's name
    const fullName = `${firstName} ${lastName}`.trim();
    user.name = fullName;
    
    // Save the updated user
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      data: { 
        name: user.name
      } 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};