# 🇮🇳 GovAI — Multilingual AI Support for Government Scheme Awareness & Fraud Detection

> A full-stack AI-powered platform that helps Indian citizens understand government schemes in multiple languages and detects potential fraud in scheme applications.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🤖 Multilingual AI Chatbot | Ask questions in English, Hindi, or Marathi about any government scheme |
| 📋 Eligibility Finder | Enter your profile and get matched government schemes |
| 🔍 Fraud Detection | Rule-based system detecting suspicious applications |
| 📊 Admin Dashboard | Charts, statistics, fraud alerts, and application management |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Groq API (Llama3) / OpenAI GPT (configurable) |
| Auth | JWT (JSON Web Tokens) |

---

## 📁 Project Structure

```
ranjit/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/             # Database & constants
│   │   ├── controllers/        # Route handler logic
│   │   ├── data/               # Static scheme data
│   │   ├── middleware/         # Auth & error handling
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routes
│   │   ├── services/           # AI, Fraud Detection, Translation
│   │   ├── utils/              # Seed script
│   │   └── app.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer
│   │   │   ├── chatbot/        # Chat UI components
│   │   │   ├── eligibility/    # Scheme finder components
│   │   │   └── admin/          # Dashboard components
│   │   ├── context/            # Language context
│   │   ├── pages/              # Page components
│   │   ├── services/           # Axios API service
│   │   ├── utils/              # Translations, constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## ⚙️ Prerequisites

- Node.js >= 18.x
- MongoDB (local or MongoDB Atlas)
- A **Groq API key** (free at [console.groq.com](https://console.groq.com)) OR an OpenAI API key

---

## 🔧 Installation & Setup

### 1. Clone and enter the project

```bash
cd "/Users/ajaykumbhar/Desktop/ranjit"
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and AI API key
```

### 3. Seed the Database

```bash
npm run seed
```

This populates MongoDB with:
- 15 real Indian government schemes
- 60 sample applications (with fraud patterns for demo)

### 4. Start Backend

```bash
npm run dev          # Development with hot-reload
# or
npm start            # Production
```

Backend runs at: `http://localhost:5000`

### 5. Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit VITE_API_URL if needed (default: http://localhost:5000/api)
```

### 6. Start Frontend

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gov-scheme-db
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Choose AI provider: 'groq' (free) or 'openai'
AI_PROVIDER=groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔐 Admin Dashboard Access

After seeding the database, log in with:

| Username | Password |
|---|---|
| `admin` | `admin@123` |

Navigate to `http://localhost:5173/admin`

---

## 🌐 API Endpoints

### Chatbot
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chatbot/message` | Send message to AI chatbot |

### Schemes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/schemes` | Get all schemes |
| GET | `/api/schemes/:id` | Get scheme by ID |
| POST | `/api/schemes/eligible` | Find eligible schemes for a user profile |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/applications` | Submit application (auto fraud detection) |
| GET | `/api/applications` | Get all applications (admin) |

### Fraud
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/fraud/alerts` | Get fraud alerts |
| PUT | `/api/fraud/alerts/:id` | Update alert status |
| GET | `/api/fraud/stats` | Fraud statistics |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/stats` | Dashboard statistics |

---

## 🧠 Fraud Detection Rules

| Rule | Score | Trigger |
|---|---|---|
| Duplicate Aadhaar | +40 | Same Aadhaar used for multiple applications in same scheme |
| Shared Bank Account | +30 | Bank account linked to multiple beneficiaries |
| IP Flood | +25 | 5+ applications from the same IP address |
| District Anomaly | +20 | Unusually high applications from one district |
| Age Inconsistency | +35 | Applicant age outside scheme's eligible range |
| Income Inconsistency | +30 | Income exceeds scheme's maximum limit |

**Fraud Levels:** Low (0–30) | Medium (31–60) | High (61–100)

---

## 🌍 Supported Languages

- 🇬🇧 English (`en`)
- 🇮🇳 Hindi (`hi`) — हिंदी
- 🇮🇳 Marathi (`mr`) — मराठी

---

## 📸 Screenshots

| Page | Description |
|---|---|
| Home | Hero section with feature highlights |
| Chatbot | Real-time multilingual AI chat interface |
| Eligibility | Profile-based scheme recommendation engine |
| Admin | Fraud alerts, charts, and application management |

---

## 🏆 Hackathon Info

**Project:** Multilingual AI Support for Government Scheme Awareness & Fraud Detection  
**Category:** GovTech / AI / Social Impact  
**Team:** Ranjit  

---

## 📄 License

MIT
