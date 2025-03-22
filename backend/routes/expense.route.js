// backend/routes/expense.routes.js
import express from 'express';
import Expense from '../models/expense.modal.js';
import User from '../models/user.model.js';
import { authenticateUser } from '../middleware/verifyAuthUser.js'; // Assuming you have auth middleware

import { isValidObjectId } from 'mongoose';
import { deleteMultipleExpenses } from '../controllers/expense.controller.js';
const router = express.Router();

// Middleware to protect all expense routes
router.use(authenticateUser);

// This is the route handler for DELETE_MULTIPLE endpoint

/**
 * @route   POST /api/expenses
 * @desc    Add a new expense
 * @access  Private
 */
router.post('/add', async (req, res) => {
  try {
    const { planId, expenses, currency } = req.body;
    const { clerkId } = req.user;
    let user = await User.findOne({ clerkId });
    
    // First, try to find an existing expense document for this plan and user
    let existingExpense = await Expense.findOne({
      planId,
      userId: user._id
    });
    
    if (existingExpense) {
      // If found, add the new expenses to the existing document
      const newExpenseEntries = expenses.map(entry => ({
        purpose: entry.purpose,
        amount: entry.amount,
        category: entry.category,
        date: entry.date || Date.now(),
        whoSpent: entry.whoSpent
      }));
      
      // Append the new expenses to the existing array
      existingExpense.expenses = [...existingExpense.expenses, ...newExpenseEntries];
      
      // Update the currency if provided
      if (currency) {
        existingExpense.currency = currency;
      }
      
      const updatedExpense = await existingExpense.save();
      res.status(200).json(updatedExpense);
    } else {
      // If not found, create a new expense document
      const newExpense = new Expense({
        planId,
        userId: user._id,
        expenses: expenses.map(entry => ({
          purpose: entry.purpose,
          amount: entry.amount,
          category: entry.category,
          date: entry.date || Date.now(),
          whoSpent: entry.whoSpent
        })),
        currency: currency || 'INR'
      });
      
      const savedExpense = await newExpense.save();
      res.status(201).json(savedExpense);
    }
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Failed to add expense', error: error.message });
  }
});
/**
 * @route   GET /api/expenses
 * @desc    Get all expenses (with optional filtering)
 * @access  Private
 */
router.post('/:id/get', async (req, res) => {
  try {
    const { category, fromDate, toDate } = req.query;
    const { id: planId } = req.params;
    
    // Build filter object with just planId
    const filter = { planId }; // Base filter by planId only
    
    // Add optional filters
    if (category) filter.category = category;
    
    // Date range filter
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) filter.date.$lte = new Date(toDate);
    }
    
    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .populate('userId', 'name'); // Optionally populate user details if needed
    
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ 
      message: 'Failed to fetch expenses', 
      error: error.message 
    });
  }
});
/**
 * @route   GET /api/expenses/:id
 * @desc    Get a specific expense by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.status(200).json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Failed to fetch expense', error: error.message });
  }
});

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an expense
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { expenses, currency } = req.body;
    
    // Find and update the expense document
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        expenses: expenses.map(entry => ({
          purpose: entry.purpose,
          amount: entry.amount,
          category: entry.category,
          date: entry.date,
          whoSpent: entry.whoSpent
        })),
        currency 
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }
    
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Failed to update expense', error: error.message });
  }
});

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense
 * @access  Private
 */
router.post('/:id/delete-multiple', deleteMultipleExpenses);

/**
 * @route   GET /api/expenses/plan/:planId
 * @desc    Get all expenses for a specific plan
 * @access  Private
 */
router.get('/plan/:planId', async (req, res) => {
  try {
    const expenses = await Expense.find({
      planId: req.params.planId,
      userId: req.user.id
    }).sort({ date: -1 });
    
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching plan expenses:', error);
    res.status(500).json({ message: 'Failed to fetch plan expenses', error: error.message });
  }
});

/**
 * @route   GET /api/expenses/summary/plan/:planId
 * @desc    Get summary of expenses for a specific plan
 * @access  Private
 */
router.get('/summary/plan/:planId', async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { 
        $match: { 
          planId: mongoose.Types.ObjectId(req.params.planId), 
          userId: mongoose.Types.ObjectId(req.user.id) 
        } 
      },
      { $unwind: "$expenses" },
      { 
        $group: {
          _id: "$expenses.category",
          totalAmount: { $sum: "$expenses.amount" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    res.status(500).json({ message: 'Failed to fetch expense summary', error: error.message });
  }
});

export default router;