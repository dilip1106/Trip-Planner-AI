import Expense from "../models/expense.modal.js";
import User from "../models/user.model.js";
import { isValidObjectId } from 'mongoose';

export const deleteMultipleExpenses = async (req, res) => {
    try {
      const { ids } = req.body;
      const { clerkId } = req.user;
      const { id:planId } = req.params;
      
      // Validate input
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No expense IDs provided" });
      }
      
      if ( !clerkId) {
        return res.status(401).json({ error: "User authentication required" });
      }
      
      if (!planId) {
        return res.status(400).json({ error: "Invalid plan ID" });
      }
      
    //   Find the user's ID from their Clerk ID
      const user = await User.findOne({ clerkId: clerkId });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Keep track of successfully deleted expense entries
      const deletedEntries = [];
      
      // Process each expense document where we need to remove entries
      for (const { expenseDocId, expenseId } of ids) {
        if (!isValidObjectId(expenseDocId) || !expenseId) {
          continue; // Skip invalid IDs
        }
        
        // Find the expense document and make sure it belongs to this plan and user
        const expenseDoc = await Expense.findOne({
          _id: expenseDocId,
          planId: planId,
        //   userId: user._id
        });
        
        if (!expenseDoc) {
          continue; // Skip if not found or not accessible to this user
        }
        
        // Find the index of the expense entry in the expenses array
        const expenseIndex = expenseDoc.expenses.findIndex(
          exp => exp._id.toString() === expenseId
        );
        
        if (expenseIndex === -1) {
          continue; // Skip if expense entry not found
        }
        
        // Remove the expense entry from the array
        expenseDoc.expenses.splice(expenseIndex, 1);
        
        // If all expenses are removed, delete the entire document
        if (expenseDoc.expenses.length === 0) {
          await Expense.deleteOne({ _id: expenseDocId });
        } else {
          // Otherwise, save the updated document
          await expenseDoc.save();
        }
        
        // Add to successfully deleted entries
        deletedEntries.push({ expenseDocId, expenseId });
      }
      
      return res.status(200).json({
        message: `Successfully deleted ${deletedEntries.length} expense entries`,
        deletedCount: deletedEntries.length,
        deletedEntries
      });
      
    } catch (error) {
      console.error("Error deleting multiple expenses:", error);
      return res.status(500).json({ error: "Failed to delete expenses", details: error.message });
    }
  };