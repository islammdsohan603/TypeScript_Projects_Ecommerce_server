<div align="center">

# 🛍️ Luxury — Premium E-Commerce Backend API

**A robust, scalable, and secure backend built with Node.js, Express, TypeScript, and MongoDB**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-5.x-black?logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)](https://stripe.com/)

</div>

---

## 📌 Project Overview

This is the backend server for the **Luxury E-Commerce** platform. It provides a RESTful API architecture to handle product data fetching, cart management, secure order processing, and payment intent orchestration via Stripe. 

Designed to be both developer-friendly and scalable, the codebase leverages TypeScript for type-safety and MongoDB for flexible data modeling.

---

## ✨ Key Features

- **Product Management:** Fetch featured products, all products with pagination & filtering, and single product details.
- **Cart Operations:** Complete CRUD API for shopping cart functionality (add, delete, update quantity, fetch by user).
- **Secure Payments (Stripe):** Creates secure checkout sessions and securely verifies payments before recording orders.
- **Order History:** Saves user orders securely and exposes an endpoint to fetch past orders by user email.
- **TypeScript Ready:** Strongly typed requests, responses, and interfaces.

---

## 🗂️ Folder Structure

```text
server/
├── src/
│   └── index.ts               # Main application entry point containing all Express routes
├── .env                       # Environment variables (not tracked in git)
├── .gitignore                 # Git ignore file
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript compiler configuration
└── vercel.json                # Vercel deployment configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- A **MongoDB Atlas** cluster URL
- A **Stripe** account (Secret Key required)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd luxury-ecommerce/server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the `server` directory and add the following keys:

```env
# Server Port
PORT=5000

# MongoDB Connection String
MONGO_DB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/Ecommerce?retryWrites=true&w=majority

# Stripe Secret Key
STRIPE_SECRET_KEY=sk_test_...

# Client Application URL (for CORS and Stripe Redirects)
CLIENT_URL=http://localhost:3000
```

### 4. Run the Development Server

To run the server in development mode with live reloading (powered by `tsx`):

```bash
npm run dev
```

The server will start at `http://localhost:5000`.

---

## 🛠️ API Endpoints Reference

### 📦 Products API
- `GET /api/featured-products` - Returns 4 featured products.
- `GET /api/all-products?category=all&sort=low-to-high&page=1` - Paginated and sortable products.
- `GET /api/details/:id` - Fetch single product by MongoDB ObjectID.

### 🛒 Cart API
- `POST /api/cart/add` - Add a product to the user's cart.
- `GET /api/cart/data?email=user@example.com` - Get all cart items for a specific user.
- `DELETE /api/cart/delete/:id` - Remove an item from the cart.
- `PATCH /api/cart/update-quantity` - Update the quantity of a specific cart item.

### 💳 Checkout & Orders API
- `POST /api/create-checkout-session` - Generates a Stripe checkout URL and Session ID.
- `POST /api/verify-payment` - Verifies payment status with Stripe and saves the order.
- `GET /api/order/payment?email=user@example.com` - Fetch order history for a user.

---

## 📦 Scripts

- `npm run dev` — Starts the server in watch mode using `tsx`.
- `npm run build` — Compiles the TypeScript code into the `dist` folder.
- `npm run start` — Runs the compiled Node.js server from `dist/index.js`.

---

## 🌐 Deployment

This server is pre-configured to be easily deployed to **Vercel** or **Render**. 
- It includes a `vercel.json` file for Vercel deployment. 
- Ensure all `.env` variables are securely added to your hosting provider's dashboard.

---

## 📄 License

MIT License