<div align="center">

# 🛍️ Luxury — Premium E-Commerce Frontend

**A high-end, full-featured e-commerce storefront built with Next.js 16 & TypeScript**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwind-css)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)](https://stripe.com/)
[![Better Auth](https://img.shields.io/badge/Better--Auth-OAuth-orange)](https://better-auth.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)

</div>

---

## 📌 Project Overview

**Luxury** is a dark-themed, premium e-commerce web application that provides a complete end-to-end shopping experience — from product discovery to secure Stripe checkout — with a focus on aesthetic quality and smooth user experience.

> **Live Demo:** _(coming soon)_  
> **Backend Repo:**  https://github.com/islammdsohan603/TypeScript_Projects_Ecommerce_server

---

## ✨ Features

### 🛒 Shopping Experience
- **Home Page** — Hero banner, featured products carousel, feature highlights, testimonials, FAQ accordion, and newsletter signup
- **Product Catalog** — Paginated grid with real-time **category filtering** and **price sorting** (low → high / high → low)
- **Product Detail Page** — Full product info with dynamic routing (`/details/[id]`)
- **Add to Cart** — One-click cart addition with instant toast feedback; quantity auto-increments on duplicate

### 💳 Checkout & Payments
- **Stripe Checkout** — Secure hosted payment page with real product data, images, and prices
- **Success Page** — Dynamically verifies the payment, displays a full order receipt (item names, quantities, prices, payment date, session ID)
- **Failed Page** — Clean error state with retry option
- **Cart Auto-Cleared** — After a successful payment, the user's cart is automatically emptied

### 👤 Authentication (Better Auth)
- **Email & Password** sign-up / sign-in
- **Google OAuth** one-click login
- **GitHub OAuth** one-click login
- Session-aware Navbar — avatar, dashboard link, and cart icon appear only when logged in

### 📊 User Dashboard
- **Overview Stats** — Items in cart, total orders, account verification status
- **Cart Management** — View all cart items with product images, dates, quantity controls (`+`/`–`), per-item total, and individual delete
- **Profile Page** — User account details

### 🎨 UI & UX
- **Dark luxury aesthetic** — Deep blacks, amber/orange accents, glassmorphism cards
- **Navigation Loader** — YouTube-style top progress bar on every page transition
- **Page-level Skeletons** — Shimmer loading states for Products and Dashboard pages
- **Full-screen Loader** — Spinner overlay on initial data loads
- **Fully Responsive** — Mobile drawer menu, responsive grids, touch-friendly controls
- **Micro-animations** — Hover effects, pulse badges, animated carousels

---

## 🗂️ Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── signin/page.tsx        # Sign-in page
│   │   │   └── signup/page.tsx        # Sign-up page
│   │   ├── about/                     # About page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx             # Shared sidebar layout
│   │   │   ├── loading.tsx            # Dashboard skeleton loader
│   │   │   ├── users/
│   │   │   │   ├── page.tsx           # Overview stats dashboard
│   │   │   │   ├── addcart/page.tsx   # Cart management page
│   │   │   │   └── profile/           # User profile page
│   │   │   └── admin/                 # Admin panel
│   │   ├── details/[id]/              # Dynamic product detail page
│   │   ├── payment/
│   │   │   ├── success/page.tsx       # Order confirmation receipt
│   │   │   └── failed/page.tsx        # Payment failure page
│   │   ├── products/
│   │   │   ├── page.tsx               # Product catalog with filters
│   │   │   └── loading.tsx            # Products shimmer skeleton
│   │   ├── api/                       # Next.js API routes (Better Auth)
│   │   ├── globals.css                # Global styles & animations
│   │   ├── layout.tsx                 # Root layout (Navbar, Footer, Toasts)
│   │   ├── loading.tsx                # Global full-screen loader
│   │   └── page.tsx                   # Home page
│   ├── components/
│   │   ├── AddtoButton/
│   │   │   ├── AddButton.tsx          # Add to cart button
│   │   │   └── Checkout.tsx           # Stripe checkout trigger
│   │   ├── dashboard/
│   │   │   ├── DashboardSiderbar.tsx  # Sidebar navigation
│   │   │   ├── DeleteCartButton.tsx   # Cart item delete
│   │   │   └── QuantityContraller.tsx # Quantity +/- controls
│   │   ├── home/                      # All home page section components
│   │   ├── productscomponents/        # Product card & grid components
│   │   └── share/
│   │       ├── Navbar.tsx             # Sticky responsive navigation
│   │       ├── Footer.tsx             # Site footer
│   │       └── NavigationLoader.tsx   # Top progress bar
│   ├── db/
│   │   └── productsdataapi.ts         # All server fetch functions & types
│   └── lib/
│       ├── auth.ts                    # Better Auth server config
│       ├── auth-client.ts             # Better Auth client hooks
│       └── stripe.ts                  # Stripe.js client loader
├── .env                               # Environment variables (see below)
├── next.config.ts                     # Next.js config (image domains, etc.)
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A [Stripe](https://stripe.com/) account (test mode keys are fine)
- A [Google Cloud](https://console.cloud.google.com/) OAuth app
- A [GitHub OAuth](https://github.com/settings/developers) app

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/luxury-ecommerce.git
cd luxury-ecommerce/client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `client/` root with the following keys:

```env
# MongoDB (shared with Better Auth for session storage)
MONGO_DB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/...

# Backend server URL
NEXT_PUBLIC_SERVER_URL=http://localhost:5000

# Better Auth — server-side
BETTER_AUTH_SECRET=your_random_secret_string_here
BETTER_AUTH_URL=http://localhost:3000

# Better Auth — client-side (must be NEXT_PUBLIC_ prefixed)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

> **How to get these keys:**
> - **MongoDB URI** → [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Connect → Drivers → copy the connection string
> - **Google OAuth** → [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth Client (Web, redirect: `http://localhost:3000/api/auth/callback/google`)
> - **GitHub OAuth** → [GitHub Settings](https://github.com/settings/developers) → New OAuth App (callback: `http://localhost:3000/api/auth/callback/github`)
> - **Stripe Keys** → [Stripe Dashboard](https://dashboard.stripe.com/) → Developers → API Keys

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> ⚠️ **Make sure the backend server is also running** on port `5000` before testing checkout or product listings. See the [backend README](../server/README.md).

---

## 🔑 Key User Flows

```
Home → Browse Products → Product Detail → Add to Cart
  └─→ Sign In/Sign Up (if not logged in)
       └─→ Dashboard → Cart → Proceed to Checkout (Stripe)
                └─→ /payment/success  ← Order saved to DB + Cart cleared
                └─→ /payment/failed   ← Error state with retry
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, DaisyUI, HeroUI |
| Auth | Better Auth (Email, Google, GitHub) |
| Payments | Stripe Checkout (hosted) |
| Database | MongoDB Atlas (via Better Auth adapter) |
| State | Redux Toolkit, React state |
| Animations | CSS keyframes, Tailwind animations |
| Icons | React Icons, Lucide React |
| Notifications | React Toastify |
| Fonts | Geist Sans, Geist Mono |

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🌐 Environment Notes

- All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secret keys there.
- `STRIPE_SECRET_KEY` and `BETTER_AUTH_SECRET` must **never** be exposed client-side.
- When deploying to production, replace all `localhost` URLs with your real domain.

---

## 📄 License

MIT — feel free to use this project as a reference or starting point.
