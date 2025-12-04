# W&P AI - Complete Setup Guide

This guide will walk you through setting up W&P AI from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Supabase Auth Setup](#supabase-auth-setup)
5. [Running the App](#running-the-app)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Make sure you have installed:
- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([download](https://git-scm.com/))

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd wp-ai
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, Supabase, and more.

---

## Database Setup

You have two options for the database:

### Option A: Supabase (Recommended - Free Tier Available)

1. Go to [supabase.com](https://supabase.com/)
2. Create a free account
3. Click "New Project"
4. Fill in:
   - **Name**: wp-ai
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)
6. Go to **Settings** → **Database**
7. Copy the **Connection String** (URI format)
8. Replace `[YOUR-PASSWORD]` with your database password

### Option B: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb wp_ai
```

Your connection string will be:
```
postgresql://localhost:5432/wp_ai
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local
nano .env.local  # or use your preferred editor
```

Update these values:

```bash
# Use your Supabase or local database URL
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Get from Supabase dashboard (we'll do this next)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Local development URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialize Database Schema

```bash
# Push schema to database
npm run db:push

# (Optional) Seed with demo data
npm run db:seed
```

✅ Your database is now set up!

---

## Supabase Auth Setup

### 1. Get API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values to `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Go to **Authentication** → **URL Configuration**
4. Add these redirect URLs:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback  (for production)
   ```

### 3. Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email if desired
3. For development, you can disable email confirmation:
   - Go to **Authentication** → **Settings**
   - Toggle off "Enable email confirmations"

✅ Auth is configured!

---

## Running the App

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### First Time Setup

1. Go to `/signup`
2. Create an account with your email
3. You'll be redirected to the dashboard
4. Go to **Settings** and configure:
   - Employee hourly wage (e.g., $20/hr)
   - Target profit margin (e.g., 30%)

### With Demo Data

If you ran `npm run db:seed`, you can login with:
- **Email**: `demo@wpai.app`
- **Password**: (Create this user in Supabase Auth manually)

To create the demo user in Supabase:
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Email: `demo@wpai.app`
4. Password: `demo123` (or your choice)
5. Click "Create user"

---

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

3. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Configure environment variables (copy from `.env.local`)
   - Click "Deploy"

4. **Update Supabase Redirect URLs**
   - Add your Vercel URL to Supabase redirect URLs:
     ```
     https://your-app.vercel.app/auth/callback
     ```

5. **Update Environment Variable**
   - In Vercel, update `NEXT_PUBLIC_APP_URL` to your Vercel URL

✅ Your app is live!

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Run production build

# Database
npm run db:push         # Push schema to database
npm run db:seed         # Seed demo data
npm run db:studio       # Open Prisma Studio (database GUI)
npm run db:reset        # Reset database and seed

# Code Quality
npm run lint            # Run ESLint
```

---

## Troubleshooting

### Database Connection Issues

**Error**: "Can't reach database server"

- Check your `DATABASE_URL` is correct
- If using Supabase, make sure you replaced `[YOUR-PASSWORD]`
- Try connection pooling URL (ends with `?pgbouncer=true`)

### Prisma Issues

**Error**: "Prisma Client not generated"

```bash
npx prisma generate
```

**Error**: "Migration failed"

```bash
npm run db:push --force-reset
npm run db:seed
```

### Auth Issues

**Error**: "Invalid login credentials"

- Check Supabase is configured correctly
- Verify environment variables are set
- Make sure user exists in Supabase Auth

**Error**: "Auth callback error"

- Check redirect URLs match exactly
- Make sure `/auth/callback` is added to Supabase

### PWA Issues

**PWA not installing**

- Must be HTTPS (except localhost)
- Service worker needs production build
- Try `npm run build && npm start`

### Build Errors

**Error**: "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

**Error**: "Type errors"

```bash
npx tsc --noEmit
```

---

## Development Tips

### Database GUI

View your data visually:
```bash
npm run db:studio
```

Opens at [http://localhost:5555](http://localhost:5555)

### Hot Reload

The dev server automatically reloads when you:
- Edit components
- Change API routes
- Update Tailwind classes

### Testing on Mobile

1. Find your local IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_APP_URL="http://192.168.x.x:3000"
   ```

3. Access from mobile: `http://192.168.x.x:3000`

### Environment Variables

Remember:
- Prefix with `NEXT_PUBLIC_` to expose to browser
- Changes require server restart
- Never commit `.env.local` to Git

---

## Next Steps

Once your app is running:

1. **Create your first walkthrough**
   - Add a client
   - Capture room details
   - Set pricing

2. **Generate a proposal**
   - Review pricing calculator
   - Adjust customer rate
   - Create proposal

3. **Test the workflow**
   - Mark proposal as sent
   - Try duplicating
   - Search and filter

4. **Customize for your business**
   - Update room types in `lib/constants.ts`
   - Adjust default times
   - Modify proposal templates

---

## Getting Help

- Check the [README](README.md) for feature documentation
- Review [Next.js docs](https://nextjs.org/docs)
- Check [Supabase docs](https://supabase.com/docs)
- Review [Prisma docs](https://www.prisma.io/docs)

---

## What's Next?

See [CLAUDE.md](CLAUDE.md) for the full feature roadmap and Phase 2 enhancements.

Happy building! 🚀
