# 🍱 FoodRescue Platform

A full-stack food donation platform connecting restaurants with NGOs, food banks, and volunteers to rescue surplus food before it expires.

---

## 🚀 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Recharts + Leaflet Maps
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT
- **AI Bot:** Rule-based analytics engine (no external API needed)

---

## 📁 Project Structure

```
Food_Donation/
├── backend/
│   ├── src/
│   │   ├── controllers/     # auth, food, claim, notification, analytics, ai, admin
│   │   ├── models/          # User, FoodListing, Claim, Notification, AIAnalysisLog
│   │   ├── routes/          # REST API routes
│   │   ├── middleware/       # JWT auth middleware
│   │   └── utils/           # db.js, seed.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/shared/  # Navbar, FoodCard, FoodMap, AIBot, StatsCard
    │   ├── context/            # AuthContext
    │   ├── hooks/              # useCountdown
    │   ├── pages/
    │   │   ├── donor/          # DonorDashboard
    │   │   ├── receiver/       # ReceiverDashboard
    │   │   ├── admin/          # AdminDashboard
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Notifications.jsx
    │   └── utils/              # api.js (axios instance)
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- VS Code

### Step 1 — Clone / Open Project
Open the `Food_Donation` folder in VS Code.

### Step 2 — Backend Setup
```bash
cd backend
npm install
```

Edit `.env` if needed (default uses local MongoDB):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/food_donation
JWT_SECRET=food_donation_secret_key_2024
```

### Step 3 — Seed Demo Data
```bash
npm run seed
```

This creates demo users, food listings, and claims.

### Step 4 — Start Backend
```bash
npm run dev
```
Backend runs at: http://localhost:5000

### Step 5 — Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

---

## 🔑 Demo Login Credentials

| Role     | Email                          | Password     |
|----------|-------------------------------|--------------|
| Admin    | admin@foodrescue.com          | admin123     |
| Donor 1  | rahul@spicegardens.com        | donor123     |
| Donor 2  | priya@biryanihouse.com        | donor123     |
| Receiver | sunita@hopefoundation.org     | receiver123  |
| Receiver | vikram@feedindia.org          | receiver123  |

---

## 🎯 Features

### Donor Dashboard
- Post surplus food with full details (name, category, quantity, meals, expiry, location)
- Edit / delete listings before claim
- Real-time expiry countdown on each listing
- Urgent badge for food expiring within 1 hour

### Receiver Dashboard
- Browse available food with filters (type, category, search)
- Interactive map showing pickup locations
- Claim food with one click
- Track claim status (claimed → picked up → completed)

### Admin Dashboard
- User management (activate/deactivate)
- All listings management
- Analytics: bar charts, pie charts, platform health metrics
- Top donors and receivers leaderboard

### AI Bot
- Chat widget (bottom-right corner)
- Answers natural language queries:
  - "Which donations are most urgent?"
  - "Show expired donations today"
  - "Who is the top donor?"
  - "Suggest priority pickups"
  - "Give me a platform summary"
  - "What is the wastage trend?"
- Rule-based urgency scoring (expiry time + quantity + food type + claim status)

### Time-Sensitive Features
- Live countdown timers on every food card
- Auto-expire listings every 60 seconds (server-side)
- Urgent badge + red border for food expiring < 1 hour
- In-app notifications for urgent food, claims, pickups

---

## 📡 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile

GET    /api/food              # All listings (with filters)
POST   /api/food              # Create listing (donor)
GET    /api/food/my           # My listings (donor)
PUT    /api/food/:id          # Update listing
DELETE /api/food/:id          # Delete listing

POST   /api/claims/:id/claim  # Claim food (receiver)
GET    /api/claims/my         # My claims (receiver)
PUT    /api/claims/:id/status # Update claim status

GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/mark-all-read

GET    /api/analytics/stats
GET    /api/analytics/top-donors
GET    /api/analytics/top-receivers
GET    /api/analytics/trend
GET    /api/analytics/categories

POST   /api/ai/ask            # AI bot query
GET    /api/ai/insights       # Auto-generated insights

GET    /api/admin/users
PUT    /api/admin/users/:id/toggle
GET    /api/admin/listings
DELETE /api/admin/listings/:id
```

---

## 🎬 Demo Flow (Presentation)

1. **Landing Page** — Show hero, stats, how it works
2. **Login as Donor** → Post a new food listing with expiry 30 mins away
3. **Login as Receiver** → See the urgent listing, claim it, view on map
4. **Back as Donor** → See claim notification, mark as picked up
5. **Login as Admin** → Show analytics charts, user management
6. **AI Bot** → Ask "Which donations are most urgent?" and "Give me a platform summary"

---

## 🏆 Project Highlights

- Real-time expiry countdown timers
- Role-based access (Donor / Receiver / Admin)
- Interactive Leaflet map with color-coded markers
- AI analytics bot with natural language queries
- Recharts analytics dashboard
- Auto-expire background job
- Push-style in-app notifications
- Clean, responsive Tailwind UI
