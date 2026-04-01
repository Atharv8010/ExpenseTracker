# 💰 Smart Expense Tracker

A full-stack MERN application to track, categorize, and visualize daily expenses with user authentication.

## 🛠️ Tech Stack

- **Frontend**: React.js, React Router, Recharts, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs

## ✨ Features

- **User Authentication** – Register/Login with JWT-based auth
- **Add Expenses** – Title, amount, category, date, and optional note
- **Edit & Delete** – Full CRUD operations on every expense
- **Category Filter** – Filter expenses by category
- **Dashboard Charts** – Pie chart (spending by category) + Bar chart (monthly trend)
- **Summary Stats** – Total spending, transaction count, top category
- **Responsive UI** – Works on desktop and mobile

## 📁 Project Structure

```
smart-expense-tracker/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with bcrypt hashing
│   │   └── Expense.js       # Expense schema with category enum
│   ├── routes/
│   │   ├── auth.js          # Register, Login, Me
│   │   └── expenses.js      # CRUD + summary endpoint
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   └── Layout.js    # Sidebar navigation
        ├── context/
        │   └── AuthContext.js  # Global auth state
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js # Charts & summary
        │   └── Expenses.js  # CRUD table with filters
        ├── utils/
        │   └── api.js       # Axios instance with auth header
        └── App.js           # Routes with protected routes
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/smart-expense-tracker.git
cd smart-expense-tracker
```

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Configure Environment

In `/backend`, create a `.env` file:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_key
```

In `/frontend`, create a `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run the App

**Start backend** (from `/backend`):
```bash
npm run dev
```

**Start frontend** (from `/frontend`):
```bash
npm start
```

## 🗂️ Expense Categories

Food · Transport · Shopping · Entertainment · Health · Education · Bills · Other

## 📸 Screenshots

> Dashboard with spending charts and recent transactions
> Expense list with category filters and CRUD actions
> Clean login/register UI


