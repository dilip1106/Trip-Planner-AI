// backend/models/expense.model.js
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['food', 'commute', 'shopping', 'gifts', 'accomodations', 'others'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  whoSpent: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;