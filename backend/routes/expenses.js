const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

// GET /api/expenses  - get all expenses for logged in user
router.get("/", async (req, res) => {
  try {
    const { category, startDate, endDate, sort } = req.query;
    let filter = { user: req.user._id };

    if (category && category !== "All") filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sortOption = sort === "oldest" ? { date: 1 } : { date: -1 };
    const expenses = await Expense.find(filter).sort(sortOption);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/expenses/summary
router.get("/summary", async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    // Monthly totals (last 6 months)
    const monthly = {};
    expenses.forEach((e) => {
      const key = new Date(e.date).toLocaleString("default", { month: "short", year: "numeric" });
      monthly[key] = (monthly[key] || 0) + e.amount;
    });

    res.json({ total, byCategory, monthly, count: expenses.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/expenses
router.post("/", async (req, res) => {
  try {
    const { title, amount, category, date, note } = req.body;
    if (!title || !amount || !category)
      return res.status(400).json({ message: "Title, amount, and category are required" });

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      date: date || Date.now(),
      note,
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/expenses/:id
router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    if (expense.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    if (expense.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await expense.deleteOne();
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
