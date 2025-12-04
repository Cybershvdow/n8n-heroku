# W&P AI - Complete Setup & Deployment Guide

**Everything you need to get W&P AI running in production.**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Supabase Storage](#supabase-storage)
6. [Deploy to Vercel](#deploy-to-vercel)
7. [Post-Deployment](#post-deployment)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Accounts (All Free Tiers Available)

- ✅ **GitHub Account** (you have this)
- ☐ **Vercel Account** - https://vercel.com (deploy hosting)
- ☐ **Supabase Account** - https://supabase.com (database + storage)
- ☐ **Anthropic Account** - https://console.anthropic.com (AI pricing)
- ☐ **OpenAI Account** - https://platform.openai.com (voice transcription)
- ☐ **Resend Account** - https://resend.com (email sending)

### Installed Software

- ✅ Git (you have this)
- ☐ Node.js 18+ - https://nodejs.org
- ☐ npm (comes with Node.js)

---

## 2. Local Setup

### Step 1: Clone Repository (if not already local)

```bash
# Clone to your local machine
git clone https://github.com/Cybershvdow/n8n-heroku.git
cd n8n-heroku/wp-ai
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all packages including:
- Next.js 14
- Prisma
- Supabase client
- All Phase 2 dependencies

**Expected output:**
```
added 805 packages in 45s
```

---

## 3. Environment Variables

### Step 1: Create Environment File

```bash
cp .env.local.example .env.local
```

### Step 2: Fill in Variables

Edit `.env.local` with your credentials:

```bash
# =========================
# DATABASE (Supabase)
# =========================
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# =========================
# SUPABASE
# =========================
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ[...your-key...]"
SUPABASE_SERVICE_ROLE_KEY="eyJ[...your-service-key...]"

# =========================
# AI APIS (Optional for MVP)
# =========================
ANTHROPIC_API_KEY="sk-ant-[...your-key...]"
OPENAI_API_KEY="sk-[...your-key...]"

# =========================
# EMAIL (Optional for MVP)
# =========================
RESEND_API_KEY="re_[...your-key...]"

# =========================
# APP CONFIGURATION
# =========================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# For production: https://your-app.vercel.app
```

### Where to Get Each Credential

#### **Supabase** (Database + Storage)

1. Go to https://supabase.com
2. Click **"New project"**
3. Fill in:
   - Name: `wp-ai`
   - Database Password: (generate strong password - SAVE THIS!)
   - Region: Choose closest to you
4. Wait 2 minutes for project creation
5. Go to **Settings** → **Database**
   - Copy **Connection string** (URI format)
   - Replace `[YOUR-PASSWORD]` with your database password
6. Go to **Settings** → **API**
   - Copy `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

#### **Anthropic** (AI Pricing)

1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Go to **API Keys**
4. Click **"Create Key"**
5. Copy key → `ANTHROPIC_API_KEY`

**Free tier:** $5 credit, then ~$3/1000 requests

#### **OpenAI** (Voice Transcription)

1. Go to https://platform.openai.com
2. Sign up / Log in
3. Go to **API Keys**
4. Click **"Create new secret key"**
5. Copy key → `OPENAI_API_KEY`

**Free tier:** $5 credit (3 months), then ~$0.006/minute of audio

#### **Resend** (Email Sending)

1. Go to https://resend.com
2. Sign up / Log in
3. Go to **API Keys**
4. Click **"Create API Key"**
5. Copy key → `RESEND_API_KEY`

**Free tier:** 100 emails/day, 3,000/month

---

## 4. Database Setup

### Step 1: Push Schema to Database

```bash
npm run db:push
```

**Expected output:**
```
✔ Generated Prisma Client
⚙️ Pushing schema to database...
✔ Your database is now in sync with your Prisma schema.
```

This creates **17 database tables**:
- 10 original models (User, Client, Walkthrough, etc.)
- 4 template models (ProposalTemplate, WalkthroughTemplate, etc.)
- 3 AI training models (AITrainingGuideline, etc.)

### Step 2: Load Default Templates

```bash
npm run db:seed
```

**Expected output:**
```
🌱 Seeding database...
✅ Created demo user: demo@wpai.app
✅ Created 3 demo clients
✅ Created demo walkthrough with 8 rooms
✅ Created demo proposal
✅ Created 3 walkthrough templates
✅ Created 3 proposal templates
✅ Created 4 content templates
🎉 Seeding completed!
```

### Step 3: Verify Database (Optional)

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555 where you can see all your data.

---

## 5. Supabase Storage

### Create Storage Buckets

1. Go to your Supabase project
2. Click **Storage** in left sidebar
3. Click **"New bucket"**

Create these 4 buckets (all **PUBLIC**):

#### Bucket 1: walkthrough-photos
- Name: `walkthrough-photos`
- Public bucket: ✅ **YES**
- File size limit: 5MB
- Allowed MIME types: `image/*`

#### Bucket 2: voice-notes
- Name: `voice-notes`
- Public bucket: ✅ **YES**
- File size limit: 10MB
- Allowed MIME types: `audio/*`

#### Bucket 3: proposal-pdfs
- Name: `proposal-pdfs`
- Public bucket: ✅ **YES**
- File size limit: 5MB
- Allowed MIME types: `application/pdf`

#### Bucket 4: proposal-signatures
- Name: `proposal-signatures`
- Public bucket: ✅ **YES**
- File size limit: 1MB
- Allowed MIME types: `image/png`

### Set Bucket Policies

For each bucket, go to **Policies** and click **"New policy"**:

```sql
-- Policy name: Public Access
-- Target roles: public
-- Policy definition:
CREATE POLICY "Public Access" ON storage.objects
FOR ALL USING (bucket_id = 'walkthrough-photos');
```

Repeat for all 4 buckets (change bucket name in each policy).

---

## 6. Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `n8n-heroku` repository
5. **Root Directory:** Browse → Select `wp-ai`
6. **Framework Preset:** Next.js (auto-detected)
7. Click **"Environment Variables"**
8. Copy ALL variables from `.env.local`:
   ```
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ANTHROPIC_API_KEY=sk-ant-...
   OPENAI_API_KEY=sk-...
   RESEND_API_KEY=re_...
   NEXT_PUBLIC_APP_URL=https://YOUR-APP.vercel.app
   ```
9. Click **"Deploy"**

**Deployment takes ~3-5 minutes**

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Setup and deploy: Y
# - Link to existing project: N
# - Project name: wp-ai
# - Directory: ./wp-ai
# - Override settings: N

# Production deployment
vercel --prod
```

### Update App URL

After deployment:
1. Copy your Vercel URL (e.g., `https://wp-ai.vercel.app`)
2. Go to Vercel project → **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_APP_URL` to your production URL
4. Click **"Redeploy"** (top right)

---

## 7. Post-Deployment

### Step 1: Create Admin User

1. Visit your deployed app: `https://your-app.vercel.app`
2. Click **"Sign Up"**
3. Enter your email and password
4. Check email for verification link
5. Verify email
6. Log in

### Step 2: Configure User Settings

1. Go to **Settings** page
2. Set your defaults:
   - **Hourly Wage:** e.g., $20.00
   - **Target Margin:** e.g., 30%
   - **Company Name:** Your business name
   - **Phone:** Your contact number

### Step 3: Test Templates

1. Go to **Templates** page (`/templates`)
2. You should see:
   - 3 Walkthrough Templates
   - 3 Proposal Templates
   - 4 Content Templates

### Step 4: Test Quick Edit

1. Create a test proposal (or use demo proposal)
2. Tap the **floating button** (bottom-right)
3. Tap **"Edit"**
4. Change the customer rate
5. Tap **"Save"**
6. Verify pricing updated

---

## 8. Testing

### Test Checklist

- [ ] **Authentication**
  - [ ] Sign up works
  - [ ] Email verification works
  - [ ] Login works
  - [ ] Logout works

- [ ] **Templates**
  - [ ] View templates at `/templates`
  - [ ] Templates load in selector
  - [ ] Can import template into walkthrough
  - [ ] Template data pre-fills correctly

- [ ] **Walkthroughs**
  - [ ] Create new walkthrough
  - [ ] Add client
  - [ ] Add rooms
  - [ ] Calculate hours correctly

- [ ] **Proposals**
  - [ ] Generate proposal from walkthrough
  - [ ] View proposal
  - [ ] Quick-edit modal opens
  - [ ] Pricing updates correctly

- [ ] **Phase 2 Features**
  - [ ] AI pricing suggestion (if API key added)
  - [ ] PDF download works
  - [ ] Public share link works
  - [ ] Email sending works (if API key added)

- [ ] **Mobile**
  - [ ] Install as PWA on phone
  - [ ] Bottom navigation works
  - [ ] Touch targets large enough
  - [ ] Quick-edit works on mobile

---

## 9. Troubleshooting

### Database Connection Errors

**Error:** `Can't reach database server`

**Solution:**
- Check DATABASE_URL is correct
- Verify Supabase project is not paused
- Check password is correct (no special characters without encoding)

---

### Build Errors on Vercel

**Error:** `Module not found`

**Solution:**
```bash
# Locally, clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run build

# If successful, commit and push
git add .
git commit -m "Fix build"
git push
```

---

### Prisma Client Errors

**Error:** `Prisma Client is not generated`

**Solution:**
```bash
npx prisma generate
npm run build
```

Vercel should auto-generate Prisma Client, but you can add to `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

---

### Photo/File Upload Errors

**Error:** `Failed to upload file`

**Solution:**
- Verify Supabase storage buckets exist
- Check buckets are PUBLIC
- Verify bucket names match exactly:
  - `walkthrough-photos`
  - `voice-notes`
  - `proposal-pdfs`
  - `proposal-signatures`
- Check file size limits

---

### Email Sending Errors

**Error:** `Failed to send email`

**Solution:**
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for errors
- For production, verify sender domain (or use `onboarding@resend.dev` for testing)

---

### AI Pricing Not Working

**Error:** `Failed to get pricing suggestion`

**Solution:**
- Verify ANTHROPIC_API_KEY is correct
- Check API credits at console.anthropic.com
- Review Vercel function logs for detailed error

---

## 🎉 Success!

If everything works, you now have:

✅ **Complete W&P AI PWA** running in production
✅ **10 ready-to-use templates**
✅ **Mobile-first quick-edit** with 2-tap flow
✅ **AI pricing suggestions** (if API key added)
✅ **Photo & voice uploads** (if storage configured)
✅ **PDF generation & email sending** (if API keys added)
✅ **E-signature capability**
✅ **AI training system** for personalized suggestions

---

## 📞 Support

**Issues?**
- Check Vercel deployment logs
- Check Supabase dashboard for errors
- Review browser console for errors
- Check API credits/quotas

**Documentation:**
- `README.md` - Overview
- `PHASE2_FEATURES.md` - Feature details
- `SETUP.md` - Original setup guide
- `DEPLOYMENT.md` - Deployment specifics

---

## 🚀 Next Steps

1. **Customize templates** with your branding
2. **Train the AI** with your historical data
3. **Invite team members** (if multi-user)
4. **Create your first real proposal**
5. **Share feedback** and iterate

**Built with Next.js 14, TypeScript, Prisma, and Claude AI** ⚡
