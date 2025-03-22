// backend/routes/expense.routes.js
import express from 'express';
import Expense from '../models/expense.modal.js';
import User from '../models/user.model.js';
import { authenticateUser } from '../middleware/verifyAuthUser.js'; // Assuming you have auth middleware

const router = express.Router();

// Middleware to protect all expense routes
router.use(authenticateUser);

/**
 * @route   POST /api/expenses
 * @desc    Add a new expense
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { planId, purpose, amount, category, date, whoSpent, currency } = req.body;
    const {clerkId} = req.user;
    let user = await User.findOne({ clerkId });
    // Create new expense with user ID from authenticated user
    const newExpense = new Expense({
      planId,
      userId:user._id, // Assuming auth middleware adds user to req
      purpose,
      amount,
      category,
      date: date || Date.now(),
      whoSpent,
      currency: currency || 'INR'
    });
    
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
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
    const {clerkId} = req.user;
    const {planId} = req.params;
    let user = await User.findOne({ clerkId });
    // Build filter object
    const filter = { userId: user._id }; // Base filter by user
    
    // Add optional filters
    if (planId) filter.planId = planId;
    if (category) filter.category = category;
    
    // Date range filter
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) filter.date.$lte = new Date(toDate);
    }
    
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.status(200).json(expenses);
    // res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
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
    const { purpose, amount, category, date, whoSpent, currency } = req.body;
    
    // Find and update the expense
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { purpose, amount, category, date, whoSpent, currency },
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
router.delete('/:id', async (req, res) => {
  try {
    const deletedExpense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }
    
    res.status(200).json({ message: 'Expense deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
});

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
      { $match: { planId: mongoose.Types.ObjectId(req.params.planId), userId: mongoose.Types.ObjectId(req.user.id) } },
      { $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
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