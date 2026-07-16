# NeuroBiz AI

**NeuroBiz AI** is an AI-powered business management platform designed for Small and Medium Enterprises (SMEs). It brings **Business Owners** and **Vendors** onto a single intelligent platform to streamline inventory management, procurement, and AI-driven marketing.

By combining business intelligence with workflow automation, NeuroBiz AI enables owners to efficiently manage stock, collaborate with vendors through a seamless procurement lifecycle, and create AI-powered marketing campaigns—all from one unified application.

---

## 🚀 Problem Statement

Small and Medium Enterprises (SMEs) often rely on manual inventory tracking, disconnected procurement processes, and expensive marketing tools.

These challenges lead to:

- Stock shortages
- Overstocking
- Manual vendor communication
- Poor marketing reach
- Inefficient business decisions

Additionally, business owners and vendors typically operate on separate systems, making procurement tracking slow and inefficient.

**NeuroBiz AI** solves these challenges by providing a unified AI-powered platform where **Business Owners** and **Vendors** collaborate seamlessly through intelligent inventory management, procurement automation, AI business insights, and marketing assistance.

---

## 👥 Platform Users

### 🏪 Business Owners
- Manage inventory
- Monitor business health
- Raise procurement requests
- Generate AI-powered marketing campaigns
- Receive AI business recommendations

### 🚚 Vendors
- Receive procurement requests
- Approve or reject orders
- Track active contracts
- Manage shipment workflow
- Use an AI Copilot tailored for vendor operations

---

## 🎯 Business Types Supported

- ✅ Pharmacy
- ✅ Restaurant
- ✅ Clothing Store

## ✨ Key Features

### 📦 Smart Inventory Management
- Add, edit, and delete inventory items
- Real-time stock monitoring
- Low stock and out-of-stock detection
- Business-specific inventory (Restaurant, Pharmacy, Clothing)

### 🤖 AI Business Health Analysis
- Business Health Score
- AI-generated business insights
- Growth opportunities
- Cost optimization suggestions
- Explainable AI (XAI) score breakdown

### 🛒 Intelligent Procurement Management
- AI-powered reorder suggestions
- Vendor Directory
- Procurement approval workflow
- Active contract tracking
- Owner–Vendor collaboration

### 💳 Procurement Payments
- Razorpay Payment Gateway integration (Test Mode)
- Seamless payment flow for procurement orders
- Real-time payment status tracking
- Invoice generation after successful payment

### 📲 Real-Time WhatsApp Notifications
- Instant procurement request notifications
- Order acceptance alerts
- Shipment status updates
- Owner–Vendor communication powered by Twilio WhatsApp API

### 🎨 AI Marketing Studio
- AI-generated promotional posters
- Instagram captions
- Marketing campaign suggestions
- Persistent workspace

### 💬 AI Business Copilot
- Owner-specific AI Assistant
- Vendor-specific AI Assistant
- Business-aware responses using live Firestore data

## 🔄 Owner & Vendor Workflow

```text
Owner
   │
Inventory Monitoring
   │
AI detects low stock
   │
Approve Procurement
   │
Vendor receives procurement request
   │
Vendor also receives an instant WhatsApp notification
   │
Vendor approves the request
   │
Owner receives WhatsApp notification
   │
Owner completes payment via Razorpay
   │
Vendor ships the order
   │
Owner receives shipment update via WhatsApp
```

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons

### Backend Services
- Firebase Firestore
- Firebase Authentication
- Firebase Storage

### AI Services
- Google Gemini API
- Cloudflare Workers AI

### Payment Gateway
- Razorpay

### Communication
- Twilio WhatsApp API (Real-time procurement notifications)

### Server
- Node.js
- Express (API proxy for AI image generation)



## ⚙️ Project Setup

```bash
git clone https://github.com/knitsri/NeuroBiz-AI
npm install
npm run dev
```


## 🔐 Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_GEMINI_API_KEY=
VITE_API_URL=
VITE_APP_URL=

CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```