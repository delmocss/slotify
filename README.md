# 🚀 Slotify — Smart Booking SaaS Platform

> A production-oriented full-stack booking system designed to simulate a real-world SaaS product with business-driven logic, scalable architecture and professional UX patterns.

---

## 🌐 Live Demo

**Frontend:** https://slotify-demo.vercel.app  
**Backend API:** https://slotify-api.onrender.com

---

## � Screenshots

### Landing 

![Landing Page](img/landing.png)

### Public booking

![Public Booking Flow](img/public_booking.png)

### Confirmation screen

![Confirmation Screen](img/confirmation.png)

### Dashboard metrics

![Dashboard Metrics](img/dashboard.png)

### Services page

![Services Management](img/services.png)

---

## �📌 Project Overview

Slotify is a full-stack appointment booking platform built as a portfolio project with a strong focus on:

- Real business constraints
- Clean architecture
- Scalable design
- Type-safe frontend
- Modular backend structure
- SaaS-oriented thinking (not just CRUD)

The goal of this project was not to build a simple reservation app, but to simulate how a real booking SaaS product would be architected, structured and extended in production.

---

## 🎯 Problem Statement

Many small businesses still rely on:

- Manual scheduling
- Phone calls
- WhatsApp messages
- Spreadsheets

This creates inefficiencies, double bookings and lack of reporting.

Slotify provides:

- Smart availability generation
- Booking flow with business rules
- Secure public cancellation
- Analytics dashboard
- Revenue tracking
- CSV export for reporting
- Branding customization

---

## 🏗 Architecture

The project follows a feature-based modular architecture both in frontend and backend.

### Frontend

- React
- TypeScript (strict mode enabled)
- Vite
- Tailwind CSS
- TanStack React Query
- React Hook Form + Zod
- Framer Motion
- Recharts
- Testing Library

### Backend

- Node.js
- Express
- PostgreSQL
- Modular feature-based architecture
- JWT authentication
- Rate limiting
- Secure cancellation tokens
- Centralized error handling

---

## 📁 Project Structure

# 🚀 Slotify — Smart Booking SaaS Platform

> A production-oriented full-stack booking system designed to simulate a real-world SaaS product with business-driven logic, scalable architecture and professional UX patterns.

---

## 📌 Project Overview

Slotify is a full-stack appointment booking platform built as a portfolio project with a strong focus on:

- Real business constraints
- Clean architecture
- Scalable design
- Type-safe frontend
- Modular backend structure
- SaaS-oriented thinking (not just CRUD)

The goal of this project was not to build a simple reservation app, but to simulate how a real booking SaaS product would be architected, structured and extended in production.

---

## 🎯 Problem Statement

Many small businesses still rely on:

- Manual scheduling
- Phone calls
- WhatsApp messages
- Spreadsheets

This creates inefficiencies, double bookings and lack of reporting.

Slotify provides:

- Smart availability generation
- Booking flow with business rules
- Secure public cancellation
- Analytics dashboard
- Revenue tracking
- CSV export for reporting
- Branding customization

---

## 🏗 Architecture

The project follows a feature-based modular architecture both in frontend and backend.

### Frontend

- React
- TypeScript (strict mode enabled)
- Vite
- Tailwind CSS
- TanStack React Query
- React Hook Form + Zod
- Framer Motion
- Recharts
- Testing Library

### Backend

- Node.js
- Express
- PostgreSQL
- Modular feature-based architecture
- JWT authentication
- Rate limiting
- Secure cancellation tokens
- Centralized error handling

---

## 📁 Project Structure

```text
slotify/
│
├── client/
│   ├── modules/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── pages/
│
├── server/
│   ├── modules/
│   ├── middleware/
│   ├── config/
│   └── routes/
```

### Design Principles

- Separation of concerns
- Feature-based organization
- Explicit typing
- Non-destructive operations
- Clear public vs authenticated boundaries

---

## � Architectural Considerations

- Business-scoped queries prevent data leakage.
- Non-destructive operations (soft toggles).
- Separation between public and authenticated routes.
- Explicit typing to prevent runtime inconsistencies.

---

## �🧩 Core Functional Features

### 🔹 Public Booking Flow

- Service selection
- Smart slot generation
- Time grouping (Morning / Afternoon / Evening)
- Daily booking limit enforcement
- Fully booked state handling
- Unique booking code generation
- Secure public cancellation via token
- Professional confirmation screen

---

### 🔹 Business Dashboard

- Revenue metrics
- Monthly performance overview
- Date range filtering
- CSV export
- Service activation / deactivation
- Daily booking limit configuration
- Business branding (logo + primary color)

---

### 🔹 Availability Engine

- Dynamic slot generation
- Conflict detection
- Daily limit enforcement
- Status-based filtering (confirmed vs cancelled)
- Non-overlapping time slots

---

### 🔹 Analytics

- Total revenue aggregation
- Revenue by month
- Booking volume tracking
- Cancel rate calculation
- Default current month view
- Range-based filtering

---

### 🔹 UX & Product Considerations

- Skeleton loading states
- Explicit empty states
- Animated transitions
- Clear booking progression
- SaaS-style dark theme
- Responsive design
- Copyable booking codes

---

## 🔐 Security & Robustness

- JWT-based authentication
- Public endpoint rate limiting
- Secure cancellation tokens (crypto-based)
- Strict TypeScript (no `any`)
- Centralized error middleware
- Business-scoped queries

---

## 🧪 Testing

Basic unit tests implemented for:

- Availability slot generation logic
- Reusable UI components

This ensures deterministic behavior in core booking logic.

---

## 🧠 SaaS vs CRUD — Conceptual Difference

This project intentionally goes beyond CRUD.

### CRUD Application

- Basic create/read/update/delete
- No business constraints
- No product-level logic
- No analytics or reporting

### SaaS Application (Slotify Approach)

- Business rules (daily booking limits)
- Smart availability engine
- Public + private flows
- Secure cancellation mechanism
- Revenue tracking
- Export functionality
- Service soft activation
- Branding per business

Slotify was designed with SaaS thinking, not simple data manipulation.

---

## 🚀 Local Development

### 1️⃣ Clone repository

- git clone https://github.com/delmocss/slotify
- cd slotify

---

### 2️⃣ Backend Setup

- cd server
- npm install

Create `.env` file:
- DATABASE_URL=postgresql://username:password@localhost:5432/slotify
- JWT_SECRET=super_secret_key
- PORT=4000

Run backend: npm run dev

Backend runs on: http://localhost:4000

---

### 3️⃣ Frontend Setup

- cd client
- npm install
- npm run dev

Frontend runs on: http://localhost:3000

---

## 🌍 Deployment Guide

### Database

Recommended providers:

- Supabase
- Neon
- Railway PostgreSQL

Steps:
1. Create PostgreSQL instance
2. Run migrations
3. Add connection string to backend environment

---

### Backend Deployment (Render / Railway)

1. Connect GitHub repository
2. Configure environment variables:
   - DATABASE_URL
   - JWT_SECRET
3. Build command: npm install
4. Start command: npm run start

---

### Frontend Deployment (Vercel)

1. Import repository
2. Add environment variable: VITE_API_URL=https://your-backend-url
3. Deploy

---

## 📈 Production-Ready Improvements

If evolving this into a production SaaS:

- Email confirmation integration
- Stripe payment flow
- Role-based access control
- Multi-business tenancy
- Timezone support
- File upload storage (S3 / Supabase Storage)
- Dockerization
- CI/CD pipeline
- End-to-end tests

---

## 🎯 What This Project Demonstrates

- Full-stack ownership
- Business-oriented feature design
- Scalable architecture
- Strong TypeScript discipline
- Secure public flows
- Product thinking beyond CRUD
- Professional UX implementation
- Clean code structure

---

## 👨‍💻 Author

Developed by Sergio Del Moral

Frontend Developer focused on building scalable SaaS-oriented applications with strong TypeScript discipline and business-driven logic.

LinkedIn: https://www.linkedin.com/in/sergio-del-moral-carrillo-6619b7234/
Portfolio: https://delmocss.github.io/