# Final Cursor Development Execution Plan — Zomato Clone

# PURPOSE

This document defines the final end-to-end development execution plan for building a production-oriented food delivery platform similar to Zomato using Cursor.

This document is intended for:

* Backend Development
* Frontend Development
* Mobile App Development
* Database Development
* API Development
* Realtime Systems
* Admin Panel Development
* Deployment
* Scaling

This is the implementation roadmap developers should follow inside Cursor.

---

# FINAL TECH STACK

# Backend

```text
Node.js
Express.js
TypeScript
MongoDB
Mongoose
Redis
Socket.io
BullMQ
JWT
```

---

# Frontend Web

```text
Next.js
React.js
TypeScript
Tailwind CSS
Redux Toolkit
React Query
Axios
```

---

# Mobile App

```text
React Native
Expo
TypeScript
Redux Toolkit
Socket.io Client
```

---

# DevOps

```text
Docker
Nginx
PM2
GitHub Actions
AWS
Cloudflare
MongoDB Atlas
Redis Cloud
```

---

# Third Party Services

```text
Razorpay
Stripe
Firebase Push Notifications
Cloudinary
Google Maps API
Twilio
SendGrid
```

---

# PROJECT STRUCTURE

# Backend Folder Structure

```text
backend/
 ├── src/
 │   ├── modules/
 │   ├── config/
 │   ├── middleware/
 │   ├── utils/
 │   ├── services/
 │   ├── queues/
 │   ├── sockets/
 │   ├── cron/
 │   ├── database/
 │   ├── validators/
 │   ├── constants/
 │   ├── interfaces/
 │   ├── types/
 │   ├── app.ts
 │   └── server.ts
```

---

# Frontend Folder Structure

```text
frontend/
 ├── app/
 ├── components/
 ├── services/
 ├── hooks/
 ├── store/
 ├── utils/
 ├── constants/
 ├── layouts/
 ├── types/
 ├── styles/
```

---

# Mobile App Folder Structure

```text
mobile/
 ├── src/
 │   ├── screens/
 │   ├── navigation/
 │   ├── services/
 │   ├── store/
 │   ├── components/
 │   ├── hooks/
 │   ├── sockets/
 │   ├── utils/
 │   ├── constants/
 │   └── assets/
```

---

# DEVELOPMENT PHASES

# PHASE 1 — PROJECT SETUP ✅ COMPLETE

See `PHASE_1.md` for verification steps.

# Backend Tasks

```text
- Initialize Node.js project
- Configure TypeScript
- Configure ESLint
- Configure Prettier
- Configure Express app
- Setup MongoDB connection
- Setup environment variables
- Setup logging system
- Setup error handling
- Setup JWT auth middleware
- Setup role middleware
```

---

# Frontend Tasks

```text
- Initialize Next.js app
- Configure Tailwind CSS
- Configure Redux Toolkit
- Configure React Query
- Configure Axios
- Configure layouts
- Configure routing
```

---

# Mobile Tasks

```text
- Initialize React Native app
- Configure navigation
- Configure Redux Toolkit
- Configure API layer
- Configure socket client
```

---

# PHASE 2 — DATABASE IMPLEMENTATION ✅ COMPLETE

See `PHASE_2.md` for collections and seed commands.

# Backend Tasks

```text
- Create MongoDB collections
- Create Mongoose schemas
- Create indexes
- Create enums
- Create relations
- Create seeders
```

---

# Collections To Build

```text
users
restaurants
menu_categories
menu_items
carts
orders
payments
riders
rider_locations
wallet_transactions
coupons
reviews
notifications
support_tickets
audit_logs
```

---

# PHASE 3 — AUTHENTICATION SYSTEM ✅ COMPLETE

See `PHASE_3.md` for API list and examples.

# Backend Tasks

```text
- User registration
- Login system
- OTP verification
- Refresh token system
- Password reset
- RBAC middleware
- Social login
```

---

# APIs To Build

```text
POST /auth/register
POST /auth/login
POST /auth/send-otp
POST /auth/verify-otp
POST /auth/refresh-token
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
```

---

# PHASE 4 — USERS MODULE ✅ COMPLETE

See `PHASE_4.md` for API list.

# Features

```text
- User profile
- Address management
- Favorites
- Wallet
- Notifications
- Order history
```

---

# APIs

```text
GET /users/profile
PATCH /users/profile
POST /users/address
PATCH /users/address/:id
DELETE /users/address/:id
GET /users/orders
```

---

# PHASE 5 — RESTAURANTS MODULE ✅ COMPLETE

See `PHASE_5.md` for Zomato browse flow + API list.

# Features

```text
- Restaurant registration
- Restaurant management
- Nearby restaurants
- Restaurant search
- Restaurant filters
```

---

# APIs

```text
POST /restaurants
GET /restaurants
GET /restaurants/:id
PATCH /restaurants/:id
DELETE /restaurants/:id
GET /restaurants/nearby
GET /restaurants/search
```

---

# PHASE 6 — MENU SYSTEM ✅ COMPLETE

See `PHASE_6.md` for full browse → menu flow.

# Features

```text
- Categories
- Menu items
- Addons
- Availability
- Search
```

---

# APIs

```text
POST /menu/categories
GET /menu/categories/:restaurantId
POST /menu/items
PATCH /menu/items/:id
DELETE /menu/items/:id
```

---

# PHASE 7 — CART SYSTEM ✅ COMPLETE

See `PHASE_7.md` for cart flow + test steps.

# Features

```text
- Add to cart
- Remove items
- Quantity update
- Coupons
- Price calculations
```

---

# APIs

```text
GET /cart
POST /cart/add
PATCH /cart/update/:id
DELETE /cart/remove/:id
DELETE /cart/clear
POST /cart/apply-coupon
```

---

# PHASE 8 — ORDER ENGINE ✅ COMPLETE

See `PHASE_8.md` for place-order flow + API list.

# MOST IMPORTANT MODULE

# Features

```text
- Order creation
- Order validation
- Order lifecycle
- Order tracking
- Refunds
- Cancellation
- Timeline tracking
```

---

# Order Lifecycle

```text
PENDING
→ CONFIRMED
→ PREPARING
→ READY_FOR_PICKUP
→ RIDER_ASSIGNED
→ PICKED_UP
→ ON_THE_WAY
→ DELIVERED
```

---

# APIs

```text
POST /orders/create
GET /orders/:id
PATCH /orders/status/:id
PATCH /orders/cancel/:id
GET /orders/track/:id
```

---

# PHASE 9 — PAYMENT SYSTEM ✅ COMPLETE

See `PHASE_9.md` for Razorpay flow + env setup.

# Features

```text
- Razorpay integration
- Stripe integration
- COD
- Refunds
- Wallet payments
- Webhooks
```

---

# APIs

```text
POST /payments/create-order
POST /payments/verify
POST /payments/webhook
POST /payments/refund
```

---

# PHASE 10 — RIDER SYSTEM ✅ COMPLETE

See `PHASE_10.md` for rider delivery flow + API list.

# Features

```text
- Rider registration
- Rider KYC
- Rider assignment
- Live tracking
- Earnings
- Delivery completion
```

---

# Rider Flow

```text
Order Created
→ Rider Assigned
→ Rider Accepts
→ Pickup Food
→ Start Delivery
→ Complete Delivery
```

---

# APIs

```text
POST /riders/register
PATCH /riders/location
PATCH /riders/accept-order/:id
PATCH /riders/complete-delivery/:id
```

---

# PHASE 11 — REALTIME SOCKET SYSTEM ✅ COMPLETE

See `PHASE_11.md` for connect + events.

# Socket Features

```text
- Live order tracking
- Rider location updates
- Restaurant order notifications
- Delivery status updates
```

---

# Socket Events

```text
order_created
order_confirmed
rider_assigned
rider_location_update
order_delivered
```

---

# PHASE 12 — NOTIFICATION SYSTEM ✅ COMPLETE

See `PHASE_12.md` for APIs + queue + channels.

# Features

```text
- Push notifications
- Email notifications
- SMS notifications
- In-app notifications
```

---

# Queue Jobs

```text
send_push
send_sms
send_email
```

---

# PHASE 13 — ADMIN PANEL ✅ COMPLETE

See `PHASE_13.md` for login + APIs.

# Features

```text
- Dashboard
- User management
- Restaurant approval
- Rider approval
- Analytics
- Refund management
- Banner management
```

---

# APIs

```text
GET /admin/dashboard
GET /admin/users
GET /admin/restaurants
GET /admin/orders
PATCH /admin/restaurants/approve/:id
PATCH /admin/riders/approve/:id
```

---

# PHASE 14 — SUPPORT SYSTEM ✅ COMPLETE

See `PHASE_14.md` for customer + admin support APIs.

# Features

```text
- Support tickets
- Ticket replies
- Refund requests
- Issue resolution
```

---

# APIs

```text
POST /support/tickets
GET /support/tickets
PATCH /support/tickets/:id
```

---

# PHASE 15 — ANALYTICS SYSTEM ✅ COMPLETE

See `PHASE_15.md` for analytics APIs.

# Features

```text
- Revenue analytics
- Order analytics
- Rider analytics
- Restaurant analytics
- Dashboard reports
```

---

# PHASE 16 — REDIS & QUEUES ✅ COMPLETE

See `PHASE_16.md` for BullMQ, cache, live tracking, and socket adapter.

# Redis Usage

```text
- Sessions
- OTPs
- Cache
- Socket scaling
- Live tracking
```

---

# BullMQ Jobs

```text
notifications
refunds
analytics
emails
sms
```

---

# PHASE 17 — SEARCH SYSTEM ✅ COMPLETE

See `PHASE_17.md` for unified search APIs.

# Features

```text
- Restaurant search
- Food search
- Trending searches
- Nearby search
```

---

# PHASE 18 — SECURITY IMPLEMENTATION ✅ COMPLETE

See `PHASE_18.md` for rate limits, sanitization, CORS, audit logs.

# Security Features

```text
- JWT auth
- Rate limiting
- Helmet
- CORS
- Input validation
- XSS protection
- Password hashing
```

---

# PHASE 19 — TESTING ✅ COMPLETE

See `PHASE_19.md` for `npm run test` and `npm run test:e2e`.

# Testing Types

```text
- Unit testing
- Integration testing
- API testing
- Load testing
- Payment testing
- Socket testing
```

---

# PHASE 20 — DEPLOYMENT

# Deployment Stack

```text
Nginx
PM2
Docker
AWS EC2
MongoDB Atlas
Redis Cloud
```

---

# Production Setup

```text
- SSL
- Environment configs
- CI/CD
- Monitoring
- Logging
- Backups
```

---

# CURSOR DEVELOPMENT WORKFLOW

# Recommended Workflow

```text
1. Create Database Schema
2. Create Mongoose Models
3. Create Validators
4. Create Controllers
5. Create Services
6. Create Routes
7. Create Middleware
8. Create Socket Handlers
9. Create Queue Jobs
10. Write Tests
```

---

# CURSOR AI PROMPTING STRATEGY

# Recommended Cursor Prompts

```text
Create Mongoose schema for users collection.

Create Express controller for order creation.

Create JWT authentication middleware.

Create Redis cache service.

Create Socket.io rider tracking service.

Create Razorpay payment verification service.
```

---

# FINAL DEVELOPMENT ORDER

```text
1. Backend Setup
2. Database Models
3. Authentication
4. Users Module
5. Restaurants Module
6. Menu Module
7. Cart Module
8. Orders Module
9. Payments Module
10. Riders Module
11. Socket System
12. Notifications
13. Admin Panel
14. Analytics
15. Deployment
```

---

# FINAL PROJECT GOAL

Build a scalable production-oriented food delivery platform with:

```text
- Customer App
- Restaurant Panel
- Rider App
- Admin Dashboard
- Wallet System
- Payment System
- Live Tracking
- Notification System
- Analytics
- Refund System
```

---

# FINAL NOTES

This document is the final Cursor-oriented implementation roadmap for developing the complete food delivery platform.

This plan is suitable for:

* Cursor development
* Backend implementation
* Frontend implementation
* Full-stack execution
* Team development
* Startup MVP
* Production V1 systems
