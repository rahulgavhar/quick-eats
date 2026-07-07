<div align="center">

<br/>

# 🍽️ QuickEats

### A full-stack food delivery platform — discover restaurants, order food, track deliveries in real time

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/rahulgavhar/quick-eats/pulls)
[![GitHub Issues](https://img.shields.io/github/issues/rahulgavhar/quick-eats?style=flat-square)](https://github.com/rahulgavhar/quick-eats/issues)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Live Features](#-live-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Database Design](#-database-design)
- [API Reference](#-api-reference)
- [Key Modules](#-key-modules)
- [Security](#-security)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Author](#-author)

---

## 🌟 Overview

**QuickEats** is a production-ready, full-stack food delivery web application built with the **MERN** stack. It supports three distinct user roles — **Customer**, **Restaurant Owner**, and **Delivery Partner** — each with a dedicated dashboard, tailored UI, and role-protected API access.

The platform features real-time geolocation-based restaurant discovery, a multi-restaurant shopping cart, Razorpay payment integration, OTP-secured deliveries, and transactional email notifications powered by Brevo.

---

## ✨ Live Features

### 👤 Customer

| Feature | Description |
|---------|-------------|
| **Google OAuth + Email Auth** | Sign up / sign in with Google (Firebase) or email + password |
| **Password Reset via OTP** | Secure 6-digit OTP sent to email (15-min expiry) |
| **Geolocation Discovery** | GPS-based nearby restaurant listing with adjustable radius (km) |
| **Interactive Map** | View restaurant locations on a Leaflet map |
| **Multi-Restaurant Cart** | Add items from multiple restaurants into a single persisted cart |
| **Checkout** | Review order by restaurant, select delivery address with map picker |
| **Razorpay Payments** | Inline online payment or Cash-on-Delivery |
| **Order Tracking** | Live order status (Pending → Preparing → Out for Delivery → Delivered) |
| **Delivery Boy Location** | Track the delivery partner's live GPS location on a map |
| **OTP Delivery Confirmation** | Confirm receipt with a one-time code sent to the delivery partner |
| **Order History** | Full history with per-restaurant breakdowns |
| **Dark / Light Mode** | Persistent theme preference via Redux + localStorage |

### 🏪 Restaurant Owner

| Feature | Description |
|---------|-------------|
| **Restaurant Registration** | Create a restaurant with cover photo (Cloudinary upload), cuisine, address, map picker |
| **Menu Management** | Add, edit, or delete menu items with categories and food type (Veg / Non-Veg) |
| **Order Dashboard** | See all incoming orders, update status in real time |
| **Delivery Assignment** | Notify nearby delivery partners about new orders |
| **Restaurant Overview** | See rating, item count, and open/closed status at a glance |

### 🛵 Delivery Partner

| Feature | Description |
|---------|-------------|
| **Assignment Dashboard** | View available delivery assignments broadcast by restaurant owners |
| **Accept / Decline** | Choose which deliveries to take on |
| **OTP-Verified Delivery** | Receive OTP via email; customer enters OTP to confirm delivery |
| **Delivery History** | Track completed assignments and stats |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | Core UI library |
| **Vite** | 7.x | Build tool & dev server |
| **Tailwind CSS** | 4.x | Utility-first styling (via `@tailwindcss/vite`) |
| **Redux Toolkit** | 2.x | Global state management |
| **redux-persist** | 6.x | Persist state to localStorage (cart, theme, user) |
| **React Router DOM** | 7.x | Client-side routing |
| **Axios** | 1.x | HTTP client (cookie-based auth) |
| **Firebase** | 12.x | Google OAuth authentication |
| **Leaflet + react-leaflet** | 1.9 / 5.x | Interactive maps & geolocation |
| **Lucide React** | 0.56x | Icon library |
| **React Icons** | 5.x | Extended icon set |
| **React Toastify** | 11.x | Toast notifications |
| **React Spinners** | 0.17x | Loading indicators |
| **reactjs-popup** | 2.x | Modal & popup components |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 22.x | Runtime environment |
| **Express** | 5.x | REST API framework |
| **Mongoose** | 9.x | MongoDB ODM with schema validation |
| **MongoDB Atlas** | — | Primary database (geospatial `2dsphere` indexes) |
| **Redis** | 5.x | Caching layer (two separate instances) |
| **bcryptjs** | 3.x | Password hashing |
| **jsonwebtoken** | 9.x | JWT authentication (HttpOnly cookies) |
| **Multer** | 2.x | Multipart file upload handling |
| **Cloudinary** | 1.x | Cloud image storage & CDN |
| **Razorpay** | 2.x | Payment gateway integration |
| **Brevo SMTP API (via Axios)** | — | Transactional email (OTP + delivery notifications) |
| **express-rate-limit** | 8.x | API rate limiting |
| **cookie-parser** | 1.x | Parse HttpOnly cookie tokens |
| **cors** | 2.x | Cross-Origin Resource Sharing |
| **dotenv** | 17.x | Environment variable management |

### DevOps & Tooling

| Tool | Purpose |
|------|---------|
| **concurrently** | Run client & server together in development |
| **nodemon** | Auto-restart server on file changes |
| **ESLint** | Code linting (react-hooks + react-refresh plugins) |
| **npm Workspaces** | Monorepo management (single `npm install` at root) |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           CLIENT  (React + Vite)                         │
│                                                                          │
│  ┌────────────┐   ┌──────────────┐   ┌─────────────────────────────┐    │
│  │  Firebase  │   │  Redux Store │   │  React Router DOM (SPA)     │    │
│  │ Google Auth│   │  (Persisted) │   │  / /signup /signin          │    │
│  └─────┬──────┘   └──────┬───────┘   │  /checkout /my-orders       │    │
│        │                 │           │  /profile /404              │    │
│        └────────┬─────────┘           └─────────────────────────────┘    │
│                 │                                                         │
│         Axios (withCredentials: true)                                     │
└─────────────────┼────────────────────────────────────────────────────────┘
                  │  HTTPS  (HttpOnly Cookie JWT)
┌─────────────────▼────────────────────────────────────────────────────────┐
│                       SERVER  (Express 5 + Node 22)                      │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────┐             │
│  │                    Middleware Stack                      │             │
│  │  CORS → JSON Parser → URL Encoder → Cookie Parser       │             │
│  │  → Rate Limiters → isAuth (JWT) → authorizeRoles        │             │
│  └──────────────────────┬──────────────────────────────────┘             │
│                         │                                                │
│  ┌──────────┬───────────┼──────────┬──────────┬─────────────┐           │
│  │  /auth   │  /user    │  /restaurants│ /items│  /orders   │           │
│  └────┬─────┴─────┬─────┴─────┬─────┴────┬────┴──────┬──────┘           │
│       │           │           │          │           │                   │
│  ┌────▼───────────▼───────────▼──────────▼───────────▼──────┐           │
│  │                       Controllers                         │           │
│  │   auth  |  user  |  restaurant  |  item  |  order        │           │
│  └────────────────────────────────────────────────────────┬─┘           │
│                                                           │              │
│  ┌───────────────────────────────┐   ┌────────────────────▼──────────┐  │
│  │         External Services     │   │         Data Layer             │  │
│  │  Brevo      (Email)           │   │  MongoDB Atlas (Primary DB)    │  │
│  │  Cloudinary (Images)          │   │  Redis (Cache — 2 instances)   │  │
│  │  Razorpay   (Payments)        │   │  Mongoose ODM                  │  │
│  │  Nominatim  (Geocoding)       │   └───────────────────────────────┘  │
│  └───────────────────────────────┘                                       │
└──────────────────────────────────────────────────────────────────────────┘
```

### Request Flow: Placing an Order

```
User selects items
      │
      ▼
Cart (Redux + localStorage)
      │
      ▼
/checkout  ──  map picker for delivery address
      │
      ├─ [Online]  ──►  POST /api/orders/create  ──►  Razorpay order created
      │                      ──►  Client opens Razorpay modal
      │                      ──►  POST /api/orders/verify-payment  (HMAC verified)
      │
      └─ [COD]     ──►  POST /api/orders/create  ──►  Order saved as "Pending"
                              │
                              ▼
                    Owner Dashboard shows order
                              │
                              ▼
                    Owner changes status  ──►  "Preparing"
                              │
                              ▼
                    POST /api/orders/delivery/notify
                    (Brevo email sent with OTP to delivery boy)
                              │
                              ▼
                    Delivery boy accepts
                    PUT /api/orders/delivery/:id/accept
                    Status  ──►  "Out for Delivery"
                              │
                              ▼
                    Customer verifies OTP
                    POST /api/orders/verify-otp/:id
                    Status  ──►  "Delivered"
```

---

## 📁 Project Structure

```
quick-eats/                              ← npm workspace root
├── package.json                         ← Workspace config + concurrently
├── package-lock.json
│
├── client/                              ← React + Vite frontend
│   ├── firebase.js                      ← Firebase Google Auth config
│   ├── vite.config.js                   ← Vite + Tailwind + React plugin
│   ├── index.html
│   └── src/
│       ├── main.jsx                     ← Entry: Provider + PersistGate + BrowserRouter
│       ├── App.jsx                      ← Route definitions + auth guards
│       ├── index.css                    ← Global styles + theme variables
│       │
│       ├── pages/
│       │   ├── Home.jsx                 ← User home (restaurant discovery)
│       │   ├── Guest.jsx                ← Landing page for unauthenticated users
│       │   ├── SignUp.jsx               ← Registration (email + Google)
│       │   ├── SignIn.jsx               ← Login flow
│       │   ├── ResetPassword.jsx        ← 4-step OTP password reset wizard
│       │   ├── Checkout.jsx             ← Cart review + address + payment
│       │   ├── MyOrders.jsx             ← Order history + live tracking
│       │   └── PageNotFound.jsx         ← 404 page
│       │
│       ├── components/
│       │   ├── General/                 ← Shared across all roles
│       │   │   ├── FoodCard.jsx
│       │   │   ├── MapPicker.jsx        ← Leaflet map for address selection
│       │   │   ├── Footer.jsx
│       │   │   ├── Loader.jsx
│       │   │   └── ErrorComponent.jsx
│       │   │
│       │   ├── User/                    ← Customer-specific components
│       │   │   ├── UserHeader.jsx
│       │   │   ├── UserMobileMenu.jsx
│       │   │   ├── UserProfileDropdown.jsx
│       │   │   ├── RestaurantCard.jsx
│       │   │   ├── CartItem.jsx
│       │   │   ├── OrderSummary.jsx
│       │   │   ├── SearchBar.jsx
│       │   │   ├── SearchedItems.jsx
│       │   │   ├── ShowOnMap.jsx        ← Live delivery tracking on Leaflet
│       │   │   └── SampleItems.jsx
│       │   │
│       │   ├── Owner/                   ← Restaurant owner components
│       │   │   ├── OwnerHeader.jsx
│       │   │   ├── OwnerMobileMenu.jsx
│       │   │   ├── OwnerProfileDropdown.jsx
│       │   │   ├── AddRestaurantForm.jsx
│       │   │   ├── AddItemForm.jsx
│       │   │   ├── ManageRestaurant.jsx
│       │   │   └── RestaurantOverview.jsx
│       │   │
│       │   ├── DeliveryBoy/             ← Delivery partner components
│       │   │   ├── Header.jsx
│       │   │   ├── MobileMenu.jsx
│       │   │   ├── ProfileDropdown.jsx
│       │   │   ├── AssignmentCard.jsx
│       │   │   └── Stats.jsx
│       │   │
│       │   ├── Guest/
│       │   │   └── GuestHeader.jsx
│       │   │
│       │   ├── Profile.jsx              ← Shared profile management (all roles)
│       │   ├── UserDashboard.jsx        ← Customer main dashboard
│       │   ├── OwnerDashboard.jsx       ← Owner main dashboard
│       │   └── DeliveryBoyDashboard.jsx
│       │
│       ├── hooks/
│       │   ├── useNearbyRestaurants.jsx ← GPS + pagination + 60s cache
│       │   ├── useGetCity.jsx           ← Reverse geocoding on mount
│       │   ├── useGetItems.jsx          ← Fetch menu items for a restaurant
│       │   ├── useGetMyRestaurant.jsx   ← Owner's restaurant data
│       │   ├── useSearchItems.jsx       ← Full-text item search
│       │   └── useLonLat.jsx            ← Coordinate utilities
│       │
│       └── redux/
│           ├── store.js                 ← Configured store + redux-persist
│           └── slices/
│               ├── userSlice.js         ← Auth, cart, coords, restaurants
│               ├── ownerSlice.js        ← Owner restaurant state
│               └── themeSlice.js        ← Dark/light mode
│
└── server/                              ← Express REST API
    ├── index.js                         ← Bootstrap: middleware, routes, static serve
    ├── config/
    │   ├── env.js                       ← Validated env loader (throws on missing keys)
    │   ├── db.js                        ← MongoDB connection (Cloudflare DNS fallback)
    │   └── filePath.js                  ← __dirname equivalent for ESM
    │
    ├── models/
    │   ├── user.model.js                ← User (roles, OTP fields, 2dsphere location)
    │   ├── restaurant.model.js          ← Restaurant (GeoJSON Point, rating, indexes)
    │   ├── restaurantProfile.model.js   ← 1:1 extended profile (image, cuisine, items)
    │   ├── item.model.js                ← Menu item (full-text index, category enum)
    │   ├── order.model.js               ← Order (multi-restaurant, Razorpay fields)
    │   └── deliveryAssignment.model.js  ← Assignment (broadcast, OTP, status)
    │
    ├── routes/
    │   ├── auth.routes.js               ← /api/auth/*
    │   ├── user.routes.js               ← /api/user/*
    │   ├── restaurant.routes.js         ← /api/restaurants/*
    │   ├── item.routes.js               ← /api/items/*
    │   └── order.routes.js              ← /api/orders/*
    │
    ├── controllers/
    │   ├── auth.controllers.js          ← signUp/signIn/signOut/googleAuth/OTP flow
    │   ├── user.controllers.js          ← Profile, city lookup, location update
    │   ├── restaurant.controllers.js    ← CRUD + geo queries + Nominatim geocoding
    │   ├── item.controllers.js          ← CRUD + full-text search + sample items
    │   └── order.controllers.js         ← Place order, Razorpay, delivery lifecycle
    │
    ├── middlewares/
    │   ├── auth.js                      ← isAuth (JWT cookie) + authorizeRoles
    │   ├── multer.js                    ← Local disk temp storage for Cloudinary
    │   └── rateLimiter.js               ← Three rate limiters (auth / location / reset)
    │
    └── utils/
        ├── cloudinary.js                ← Upload + local cleanup helper
        ├── mail.js                      ← Brevo HTML email (OTP + delivery notify)
        ├── otpToken.js                  ← Crypto-secure OTP generator
        ├── token.js                     ← JWT sign helper
        ├── redisClient.js               ← Primary Redis (user/session cache)
        └── redisClientRestaurant.js     ← Secondary Redis (restaurant cache)
```

---

## 🗄️ Database Design

QuickEats uses **MongoDB Atlas** with **Mongoose**. All models include `timestamps: true`.

### Collections & Relationships

```
┌──────────────┐          ┌───────────────────────────┐
│    User      │ 1 ─── N  │  Order                    │
│──────────────│          │───────────────────────────│
│ fullName     │          │ user         (ref User)   │
│ email        │          │ paymentMethod (COD|Online)│
│ password     │          │ deliveryAddress            │
│ role (enum)  │          │   addressLine             │
│   user       │          │   coordinates {lat, lon}  │
│   owner      │          │ orders[] (sub-document)   │
│   deliveryBoy│          │   restaurantId (ref)      │
│ location     │          │   items[] {itemId, qty}   │
│  (GeoJSON)   │          │   subTotal                │
│ orders[]     │          │   assignment  (ref)       │
│ otp fields   │          │   assignedDeliveryBoy     │
└──────────────┘          │ totalAmount               │
                          │ status (enum)             │
                          │ razorpayOrderId           │
                          │ razorpayPaymentId         │
                          └───────────────────────────┘

┌────────────────────┐  1:1  ┌───────────────────────┐
│   Restaurant       │ ────  │  RestaurantProfile    │
│────────────────────│       │───────────────────────│
│ name               │       │ restaurantId (ref)    │
│ city / state       │       │ cuisine               │
│ location (2dsphere)│       │ address               │
│ isOpen             │       │ image (Cloudinary URL)│
│ rating             │       │ phone / email         │
│ ratingCount        │       │ owner     (ref User)  │
└────────────────────┘       │ items[]   (ref Item)  │
                             │ orders[]              │
                             └───────────────────────┘

┌───────────────────────┐     ┌─────────────────────────────┐
│        Item           │     │   DeliveryAssignment        │
│───────────────────────│     │─────────────────────────────│
│ name  (text index)    │     │ orderId     (ref Order)     │
│ description           │     │ assignedTo  (ref User)      │
│ price                 │     │ restaurantId (ref)          │
│ restaurantId (ref)    │     │ broadcastedTo[] (User[])    │
│ foodType              │     │ status                      │
│   Vegetarian          │     │   unassigned | assigned     │
│   Non-Vegetarian      │     │   completed                 │
│ category (enum)       │     │ acceptedAt                  │
│   Appetizer           │     │ otp (numeric)               │
│   Main Course ...     │     └─────────────────────────────┘
│ image (Cloudinary URL)│
└───────────────────────┘
```

### MongoDB Indexes

| Collection | Field(s) | Index Type | Purpose |
|---|---|---|---|
| `users` | `location` | `2dsphere` | Geospatial delivery-boy lookups |
| `users` | `email` | Standard | Fast auth lookup |
| `users` | `mobile`, `role` | Standard | Role filtering |
| `restaurants` | `location` | `2dsphere` | `$nearSphere` nearby queries |
| `restaurants` | `state, city, isOpen` | Compound | City/state listing with status filter |
| `restaurants` | `rating` | Descending | Top-rated sorting |
| `items` | `name` | `text` | Full-text food search |
| `items` | `restaurantId, category` | Compound | Menu category filtering |
| `restaurantProfiles` | `restaurantId`, `owner` | Standard | 1:1 ownership lookup |

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected routes require a valid JWT in the `token` HttpOnly cookie.

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Auth | Rate Limited | Description |
|--------|----------|------|------|-------------|
| `POST` | `/signup` | — | ✅ | Register with email & password |
| `POST` | `/signin` | — | ✅ | Log in, receive HttpOnly JWT cookie |
| `POST` | `/google-auth` | — | ✅ | Firebase Google OAuth sign-in / upsert |
| `POST` | `/signout` | — | — | Clear auth cookie |
| `POST` | `/reset-password/send-otp` | — | ✅ | Send 6-digit OTP to email |
| `POST` | `/reset-password/resend-otp` | — | ✅ | Resend OTP |
| `POST` | `/reset-password/verify-otp` | — | — | Verify OTP (15-min window) |
| `POST` | `/reset-password/reset` | — | — | Set new password after OTP verified |

### 👤 User — `/api/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/current` | ✅ | Get current authenticated user |
| `PUT` | `/update` | ✅ | Update profile (name, phone, etc.) |
| `POST` | `/get-city` | Rate Limited | Reverse geocode coordinates to city/state |
| `POST` | `/update-location` | ✅ | Save user's GPS coordinates to DB |

### 🏪 Restaurants — `/api/restaurants`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/create` | ✅ | owner | Create restaurant + upload cover photo |
| `PUT` | `/edit/:restaurantId` | ✅ | owner | Update restaurant details |
| `DELETE` | `/delete/:restaurantId` | ✅ | owner | Delete restaurant |
| `GET` | `/id/:restaurantId` | — | — | Get restaurant + profile by ID |
| `GET` | `/owner` | ✅ | owner | Get authenticated owner's restaurant |
| `GET` | `/city/:city` | — | — | List restaurants in a city |
| `GET` | `/state/:state` | — | — | List restaurants in a state |
| `GET` | `/nearby` | ✅ | Rate Limited | Paginated nearby restaurants (geospatial) |
| `GET` | `/address` | ✅ | Rate Limited | Reverse geocode via Nominatim |

### 🍔 Items — `/api/items`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/create/:restaurantId` | ✅ | Add menu item to a restaurant |
| `PUT` | `/edit/:itemId` | ✅ | Update item details |
| `DELETE` | `/delete/:itemId` | ✅ | Delete a single item |
| `DELETE` | `/restaurant/:restaurantId` | ✅ | Delete all items of a restaurant |
| `GET` | `/restaurant` | ✅ | Get all items for owner's restaurant |
| `POST` | `/search` | ✅ | MongoDB full-text item search |
| `POST` | `/samples` | ✅ | Get sample items for multiple restaurants |

### 📦 Orders — `/api/orders`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/create` | ✅ | user | Place order (Razorpay order created if Online) |
| `GET` | `/all` | ✅ | user/owner | Get orders (role-based: history vs. incoming) |
| `PUT` | `/status/:id` | ✅ | owner | Update order status |
| `POST` | `/verify-payment` | ✅ | user | Verify Razorpay HMAC signature |
| `POST` | `/verify-otp/:id` | ✅ | user | Confirm delivery with OTP → "Delivered" |
| `GET` | `/delivery/my` | ✅ | deliveryBoy | View available assignments |
| `PUT` | `/delivery/:id/accept` | ✅ | deliveryBoy | Accept a delivery assignment |
| `GET` | `/deliveryboy-location/:orderId` | ✅ | user | Get delivery partner's live GPS location |
| `POST` | `/delivery/notify` | ✅ | owner | Broadcast assignment + send Brevo email |

### 🏥 Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Returns `{ status: "OK", timestamp }` |

---

## 🔧 Key Modules

### 🗺️ Geolocation System (`useNearbyRestaurants`)

The `useNearbyRestaurants` hook implements a smart caching and pagination strategy:

- **Browser Geolocation API** gets the user's GPS coordinates on mount
- Coordinates are passed to `GET /api/restaurants/nearby` with a configurable **radius** (default 3 km, UI-adjustable)
- Results are **paginated** (8 per page) with full `pagination` metadata
- Each restaurant is **enriched** by fetching its profile (`/api/restaurants/id/:id`)
- Results are **cached in Redux + localStorage** with a **60-second TTL** — fast navigations skip the API call entirely
- A **developer mode** lets you override GPS coordinates from a map picker for testing different locations

### 🛒 Cart & Checkout

- Cart state lives in **Redux** and is persisted to `localStorage` via `redux-persist`
- Supports items from **multiple restaurants** in one checkout session
- `Checkout.jsx` groups items by restaurant, fetches prices, and calculates totals
- Delivery address is selected interactively via the **Leaflet MapPicker** component
- On submit: creates an order server-side, optionally opens the **Razorpay modal**, then verifies payment signature

### 🔑 Authentication

- **Email/Password**: bcryptjs hashed. JWT stored in an **HttpOnly cookie** — never accessible to JavaScript (XSS safe)
- **Google OAuth**: Firebase handles the popup/redirect flow. The ID token is exchanged at `/api/auth/google-auth` which upserts the user in MongoDB and sets the cookie
- **OTP Reset**: 4-step flow: enter email → receive OTP email → verify OTP → set new password. OTP fields use Mongoose `select: false` to prevent accidental exposure

### 📧 Email Service (Brevo)

`utils/mail.js` sends two types of beautifully styled, branded HTML emails via the **Brevo REST API**:

1. **Password Reset OTP** — green-branded card with prominent OTP code, 15-minute expiry notice, and security warning
2. **Delivery Assignment Notification** — blue-branded email with Order ID and the delivery verification OTP

### ☁️ Image Uploads (Cloudinary)

`utils/cloudinary.js` provides a clean `uploadToCloudinary(filePath, folder)` helper:

- **Multer** buffers the multipart file to a local temp directory
- The helper uploads to Cloudinary with `resource_type: 'auto'`
- The local temp file is **always deleted** (success or failure) to prevent disk leaks
- Returns the CDN `secure_url` which is stored in MongoDB

### ⚡ Redis Caching (Dual-Instance)

Two separate Redis clients are configured for isolation:

| Client | Purpose |
|--------|---------|
| `redisClient` | General cache — user sessions, city lookups |
| `redisClientRestaurant` | Restaurant cache — nearby query results, menu data |

Dual instances allow independent scaling, separate TTLs, and independent eviction policies.

### 🚦 Rate Limiting

Three `express-rate-limit` configurations protect sensitive endpoints:

| Limiter | Window | Max Requests | Applied To |
|---------|--------|--------------|-----------|
| `authRateLimiter` | 15 min | 20/IP | `/signup`, `/signin`, `/google-auth` |
| `passwordResetRateLimiter` | 15 min | 5/IP | All `/reset-password/*` routes |
| `locationRateLimiter` | 10 min | 15/user | `/nearby`, `/address`, `/get-city` |

---

## 🔒 Security

| Measure | Implementation |
|---------|---------------|
| **JWT in HttpOnly cookies** | Tokens never exposed to JavaScript — no XSS risk |
| **Role-based access control** | `authorizeRoles(['user' / 'owner' / 'deliveryBoy'])` on every protected route |
| **Password hashing** | bcryptjs with automatic salt rounds |
| **OTP field isolation** | Mongoose `select: false` on `otp`, `password` — never returned in queries |
| **Rate limiting** | Three independent limiters on auth, password reset, and geolocation |
| **Startup env validation** | Server throws immediately if any required env variable is missing |
| **Razorpay HMAC verification** | Server-side signature check before any order is marked as paid |
| **Strict CORS** | Allowlist restricted to `CLIENT_URL`; `credentials: true` required |
| **Reverse-proxy trust** | `app.set("trust proxy", 1)` ensures correct IP extraction in production |
| **File cleanup on failure** | Temp uploads deleted from disk even if Cloudinary upload fails |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 22.x`
- **npm** `>= 9.x`
- A **MongoDB Atlas** cluster
- Two **Redis** instances (or one with separate logical DBs)
- A **Cloudinary** account
- A **Razorpay** account (test keys work locally)
- A **Brevo** account for transactional email
- A **Firebase** project with Google Sign-In enabled
- A **Geoapify** API key (for reverse geocoding)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rahulgavhar/quick-eats.git
cd quick-eats

# 2. Install all workspace dependencies in one step
npm install --workspaces --include=dev

# 3. Configure environment variables
#    Create server/.env  (see Environment Variables section)
#    Create client/.env  (see Environment Variables section)

# 4. Start client + server concurrently
npm run dev
```

> **Client** → `http://localhost:5173`  
> **Server** → `http://localhost:3000`

---

## ⚙️ Environment Variables

### `server/.env`

```env
# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/quickeats

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Redis
REDIS_URL=redis://localhost:6379
REDIS_RESTAURANT_URL=redis://localhost:6380

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Email (Brevo)
OTP_EMAIL=noreply@yourdomain.com
OTP_EMAIL_PASSWORD=your_brevo_api_key

# Geolocation
GEO_API_KEY=your_geoapify_api_key

# Payments
RAZORPAY_API=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### `client/.env`

```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_APIKEY=your_firebase_web_api_key
```

---

## 📜 Scripts

### Root (Monorepo)

```bash
npm run dev      # Start client + server concurrently (nodemon + vite)
npm run build    # Install deps in all workspaces + build client for production
npm run start    # Start production Node server (serves built React app as static files)
```

### Server

```bash
npm run dev      # nodemon index.js  — hot-reload on file changes
npm run start    # node index.js     — production
```

### Client

```bash
npm run dev      # Vite dev server with HMR
npm run build    # Production build → client/dist/
npm run preview  # Preview production build locally
npm run lint     # ESLint (react-hooks + react-refresh rules)
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please open an [issue](https://github.com/rahulgavhar/quick-eats/issues) first for major changes to discuss what you'd like to change.

---

## 👨‍💻 Author

**Rahul Gavhar**

[![GitHub](https://img.shields.io/badge/GitHub-rahulgavhar-181717?style=for-the-badge&logo=github)](https://github.com/rahulgavhar)

---

<div align="center">

Made with ❤️ and a lot of ☕

⭐ Star this repo if you found it useful!

</div>
