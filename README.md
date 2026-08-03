# VESTIAIRE ── Editorial Wardrobe & Digital Closet Application

A modern, luxury-inspired digital wardrobe application that brings an editorial magazine aesthetic to personal wardrobe management. Built with Next.js 14, Supabase SSR, and Google Gemini 2.5 Flash Vision AI.

![VESTIAIRE Banner](https://raw.githubusercontent.com/your-username/vestiaire/main/public/banner-preview.png)

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
