import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import "./Dashboard.css";

const CATEGORY_COLORS = {
  Food: "#f59e0b",
  Transport: "#3b82f6",
  Shopping: "#ec4899",
  Entertainment: "#8b5cf6",
  Health: "#10b981",
  Education: "#06b6d4",
  Bills: "#ef4444",
  Other: "#6b7280",
};

const CATEGORY_ICONS = {
  Food: "🍔", Transport: "🚗", Shopping: "🛍️", Entertainment: "🎮",
  Health: "💊", Education: "📚", Bills: "📄", Other: "📦"
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, expensesRes] = await Promise.all([
          API.get("/expenses/summary"),
          API.get("/expenses?sort=newest"),
        ]);
        setSummary(summaryRes.data);
        setRecentExpenses(expensesRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  const pieData = summary
    ? Object.entries(summary.byCategory).map(([name, value]) => ({ name, value }))
    : [];

  const monthlyData = summary
    ? Object.entries(summary.monthly)
        .slice(-6)
        .map(([month, amount]) => ({ month, amount }))
    : [];

  const topCategory = pieData.sort((a, b) => b.value - a.value)[0];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Good {getGreeting()}, {user?.name?.split(" ")[0]}! 👋</h1>
          <p className="subtitle">Here's your expense overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: "#eef2ff", color: "#4f46e5" }}>💸</div>
          <div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">₹{summary?.total?.toFixed(2) || "0.00"}</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>📊</div>
          <div>
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{summary?.count || 0}</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: "#fef3c7", color: "#f59e0b" }}>🏆</div>
          <div>
            <div className="stat-label">Top Category</div>
            <div className="stat-value">{topCategory?.name || "—"}</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: "#fce7f3", color: "#ec4899" }}>📅</div>
          <div>
            <div className="stat-label">Avg per Entry</div>
            <div className="stat-value">
              ₹{summary?.count ? (summary.total / summary.count).toFixed(2) : "0.00"}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <h2 className="chart-title">Spending by Category</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`₹${v.toFixed(2)}`, "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-legend">
                {pieData.map((entry) => (
                  <div key={entry.name} className="legend-item">
                    <span className="legend-dot" style={{ background: CATEGORY_COLORS[entry.name] }}></span>
                    <span>{CATEGORY_ICONS[entry.name]} {entry.name}</span>
                    <span className="legend-amount">₹{entry.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-chart">No data yet. Add some expenses!</div>
          )}
        </div>

        <div className="card">
          <h2 className="chart-title">Monthly Trend</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: "#94a3b8" }} />
                <YAxis fontSize={12} tick={{ fill: "#94a3b8" }} />
                <Tooltip formatter={(v) => [`₹${v.toFixed(2)}`, "Spent"]} />
                <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No monthly data yet.</div>
          )}
        </div>
      </div>

      <div className="card recent-card">
        <h2 className="chart-title">Recent Transactions</h2>
        {recentExpenses.length > 0 ? (
          <div className="recent-list">
            {recentExpenses.map((exp) => (
              <div key={exp._id} className="recent-item">
                <div className="recent-icon">{CATEGORY_ICONS[exp.category]}</div>
                <div className="recent-info">
                  <div className="recent-title">{exp.title}</div>
                  <div className="recent-meta">{exp.category} • {new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                </div>
                <div className="recent-amount">₹{exp.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-chart">No expenses yet. Start adding!</div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
