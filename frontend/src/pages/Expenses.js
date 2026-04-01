import { useState, useEffect } from "react";
import API from "../utils/api";
import "./Expenses.css";

const CATEGORIES = ["All", "Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Bills", "Other"];
const CATEGORY_ICONS = {
  Food: "🍔", Transport: "🚗", Shopping: "🛍️", Entertainment: "🎮",
  Health: "💊", Education: "📚", Bills: "📄", Other: "📦"
};
const CATEGORY_COLORS = {
  Food: "#fef3c7", Transport: "#dbeafe", Shopping: "#fce7f3", Entertainment: "#ede9fe",
  Health: "#d1fae5", Education: "#cffafe", Bills: "#fee2e2", Other: "#f1f5f9"
};

const EMPTY_FORM = { title: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0], note: "" };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = filterCategory !== "All" ? `?category=${filterCategory}` : "";
      const { data } = await API.get(`/expenses${params}`);
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [filterCategory]);

  const openAddModal = () => {
    setEditingExpense(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date).toISOString().split("T")[0],
      note: expense.note || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category) {
      setFormError("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingExpense) {
        await API.put(`/expenses/${editingExpense._id}`, form);
      } else {
        await API.post("/expenses", form);
      }
      setShowModal(false);
      fetchExpenses();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/expenses/${id}`);
      setDeleteConfirm(null);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const totalFiltered = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p className="subtitle">{expenses.length} records • Total: ₹{totalFiltered.toFixed(2)}</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Expense</button>
      </div>

      <div className="filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${filterCategory === cat ? "active" : ""}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat !== "All" && CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : expenses.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">🧾</div>
          <h3>No expenses found</h3>
          <p>Add your first expense to get started</p>
          <button className="btn btn-primary" onClick={openAddModal}>+ Add Expense</button>
        </div>
      ) : (
        <div className="expense-list">
          {expenses.map((exp) => (
            <div key={exp._id} className="expense-item card">
              <div className="exp-icon" style={{ background: CATEGORY_COLORS[exp.category] }}>
                {CATEGORY_ICONS[exp.category]}
              </div>
              <div className="exp-details">
                <div className="exp-title">{exp.title}</div>
                <div className="exp-meta">
                  <span className="exp-category">{exp.category}</span>
                  <span>•</span>
                  <span>{new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  {exp.note && <><span>•</span><span className="exp-note">{exp.note}</span></>}
                </div>
              </div>
              <div className="exp-amount">₹{exp.amount.toFixed(2)}</div>
              <div className="exp-actions">
                <button className="action-btn edit-btn" onClick={() => openEditModal(exp)} title="Edit">✏️</button>
                <button className="action-btn delete-btn" onClick={() => setDeleteConfirm(exp._id)} title="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {formError && <div className="error-msg">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input className="form-control" type="text" placeholder="e.g. Lunch at canteen"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input className="form-control" type="number" placeholder="0.00" min="0" step="0.01"
                    value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input className="form-control" type="date"
                    value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select className="form-control" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Note (optional)</label>
                <input className="form-control" type="text" placeholder="Any extra note..."
                  value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingExpense ? "Update" : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal confirm-modal card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>Delete Expense?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
