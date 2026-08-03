# VESTIAIRE ── Editorial Wardrobe & Digital Closet Application

A modern, luxury-inspired digital wardrobe application that brings an editorial magazine aesthetic to personal wardrobe management. Built with Next.js 14, Supabase SSR, and Google Gemini 2.5 Flash Vision AI.


---

## 🌟 Key Features

* **Editorial Aesthetic ("Tira Design Language"):** High-contrast typography featuring Google Font **Fraunces** (Serif) and **Inter** (Sans-Serif) with a signature `#4A121A` Oxblood Maroon accent palette on a crisp white canvas.
* **AI-Powered Garment Vision:** Upload or capture garment photos to automatically tag category, primary color, pattern, material, and formality score (1–10) using Google Gemini 2.5 Flash Vision AI.
* **Frameless Wardrobe Grid:** Browse your collection in a responsive 3-column Tira grid with dynamic filtering by category, formality, and upload date.
* **Multi-Tenant Security (Supabase SSR & RLS):** Complete session persistence, protected route middleware (`/closet`, `/inventory`, `/settings`), and strict Row Level Security (RLS) guaranteeing user data isolation.
* **Serverless Backend Architecture:** Gemini API operations executed securely via serverless Next.js API routes (`process.env.GEMINI_API_KEY`) with zero client-side credential exposure.
* **Mobile-First PWA Support:** Designed for desktop and mobile viewports with native mobile camera capture and home-screen install capability.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & Authentication:** [Supabase](https://supabase.com/) (PostgreSQL, SSR Auth, RLS Policies, Storage Buckets)
* **AI Engine:** [Google Gemini 2.5 Flash Vision AI](https://ai.google.dev/)
* **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18.x or later
* A Supabase project instance
* A Google Gemini API key

### Installation

1. **Clone the repository:**
  
   git clone [https://github.com/YOUR_GITHUB_USERNAME/vestiaire.git](https://github.com/YOUR_GITHUB_USERNAME/vestiaire.git)
   cd vestiaire
Install dependencies:

Bash
npm install
Set up environment variables:
Create a .env.local file in the root directory:

Code snippet
# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
Initialize the database:
Execute the supabase_schema.sql file in your Supabase SQL Editor to establish the required profiles and garments tables, Row Level Security policies, storage bucket rules, and automated user creation triggers.

Run the local development server:

Bash
npm run dev
Open http://localhost:3000 in your browser.

🏗️ Production Build & Verification
To verify type correctness and generate an optimized production build locally:

Bash
npm run build
📁 Repository Structure
vestiaire/
├── app/
│   ├── api/
│   │   └── analyze-garment/   # Gemini Serverless Vision API Route
│   ├── closet/                # Main Garment Collection Grid
│   ├── inventory/             # Quick Management & Filtering
│   ├── login/                 # Editorial Authentication Screen
│   ├── register/              # Account Sign-Up Route
│   ├── settings/              # User Preferences & Profile
│   ├── layout.tsx             # Global Root Layout & Font Providers
│   ├── page.tsx               # Entry Landing / Auth Router
│   └── middleware.ts          # Edge Protected Route Middleware
├── components/
│   ├── HeaderNav.tsx          # Editorial Brand Navigation
│   ├── GarmentCard.tsx        # Frameless Garment Card Component
│   └── ui/                    # Reusable Form & Layout Elements
├── services/                  # Database & External Service Adapters
├── public/                    # Static Assets & Icons
├── .env.example               # Environment Variables Template
├── supabase_schema.sql        # Database Architecture & RLS Script
└── tailwind.config.ts         # Custom Spatial Grid & Color Tokens
🔒 Security
No Hardcoded Keys: Secrets are strictly loaded from environment variables and excluded from version control via .gitignore.

Row Level Security (RLS): Garment data and uploaded image folders are strictly segmented by auth.uid(). Users can only access their own items.
