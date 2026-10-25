# Smart Product Recommendation System

A full-stack MERN + Python ML web application that delivers content-based product recommendations using TF-IDF + Cosine Similarity trained on an Amazon products dataset.

## Architecture

```
React (Vite) → Node.js/Express → MongoDB
                     ↓
              Python Flask ML Service
              (TF-IDF + Cosine Similarity)
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB running locally on port 27017 (or update MONGO_URI)

## Setup & Run

### 1. ML Service (run first)

```bash
cd ml-service
pip install -r requirements.txt
python train.py          # generates similarity.pkl + products.pkl
python app.py            # starts Flask on port 5001
```

Verify: `curl http://localhost:5001/health` → `{"status":"ok"}`

### 2. Backend

```bash
cd backend
npm install
# Edit .env — set JWT_SECRET to a strong random string
npm run seed             # loads amazon.csv into MongoDB
npm start                # starts Express on port 5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # starts Vite on port 5173
```

Open http://localhost:5173

## Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_recommendation
JWT_SECRET=<strong_secret>
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:5001
CLIENT_ORIGIN=http://localhost:5173
```

**ml-service/.env**
```
FLASK_PORT=5001
NODE_ORIGIN=http://localhost:5000
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Creating an Admin User

After seeding, use MongoDB Compass or mongosh to set a user's role:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

## Recommendation Pipeline

```
amazon.csv → clean → TF-IDF vectorize (name+category+description)
→ cosine_similarity matrix → similarity.pkl + products.pkl
→ Flask /recommend → Node.js /api/recommend → React UI
```

## Future Enhancements

- Collaborative filtering once sufficient user interaction data exists
- Voice-based product search
- Product comparison feature
- AI shopping assistant chatbot
- Per-attribute recommendation explanations
- Time-series analytics charts
