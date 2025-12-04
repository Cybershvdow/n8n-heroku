# W&P AI - Walkthroughs & Proposals

A mobile-first Progressive Web App (PWA) for janitorial proposal generation with pricing intelligence.

## 🎯 Overview

W&P AI streamlines the janitorial proposal process from walkthrough to signed contract. Create professional proposals in under 5 minutes with intelligent pricing calculations and beautiful mobile-first design.

## ✨ Features (MVP Complete)

### 🏢 Walkthrough Creation
- Client management with search
- Property details capture
- Room-by-room assessment
- 14 pre-configured room types
- Real-time hour totals

### 💰 Pricing Calculator
- Live pricing calculations
- Customer rate slider
- Quick multipliers (1.35x-2x)
- Profit margin analysis
- Labor cost breakdown

### 📄 Proposal Management
- Status tracking (Draft → Sent → Won/Lost)
- Search and filter
- One-click duplication
- Complete client view
- Dashboard analytics

### ⚙️ User Settings
- Default hourly wage
- Target profit margin
- Account management

### 📱 PWA Ready
- Installable on mobile
- App shortcuts
- Offline support
- Native app feel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Setup database
npx prisma db push

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📝 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🧮 Pricing Formula

```
Total Hours/Month = (Daily Minutes ÷ 60) × Days/Week × 4.33
Labor Cost = Employee Wage × Total Hours
Revenue = Customer Rate × Total Hours
Profit = Revenue - Labor Cost
Margin = (Profit ÷ Revenue) × 100
```

## 📱 Mobile Installation

**iOS**: Safari → Share → Add to Home Screen
**Android**: Chrome → Menu → Add to Home screen

## 🏗️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL + Prisma
- **Auth**: Supabase
- **PWA**: next-pwa
- **Icons**: Lucide React

## 🎨 Design

- Dark theme (#0A0E1A)
- Neon lime accent (#D4FF00)
- Glassmorphism cards
- Mobile-first responsive
- 44px+ touch targets

## 📊 Database

10 models: User, Client, Walkthrough, Room, Photo, VoiceNote, Note, Proposal, ProposalActivity, PricingRule, AISuggestion

## 🚢 Deployment

### Vercel

```bash
npm i -g vercel
vercel
```

Configure environment variables in Vercel dashboard, then deploy.

## 🔮 Roadmap (Phase 2)

- AI pricing suggestions (Claude API)
- PDF generation
- Client portal
- Email/SMS sending
- E-signature
- Photo uploads
- Voice transcription

## 📝 License

MIT

---

**Built with Next.js 14, TypeScript, and Tailwind CSS**
