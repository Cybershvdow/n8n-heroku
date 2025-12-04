# ⚡ W&P AI - 5-Minute Quickstart

Get up and running in 5 minutes.

---

## 1️⃣ Clone & Install (1 min)

```bash
git clone https://github.com/Cybershvdow/n8n-heroku.git
cd n8n-heroku/wp-ai
npm install
```

---

## 2️⃣ Setup Supabase (2 min)

1. Go to https://supabase.com → **New project**
2. Name: `wp-ai` | Password: (save it!) | Region: nearest
3. **Settings → API** → Copy these 3 values:
   - `URL`
   - `anon public` key
   - `service_role` key
4. **Settings → Database** → Copy connection string (replace `[PASSWORD]`)
5. **Storage** → Create 4 **PUBLIC** buckets:
   - `walkthrough-photos`
   - `voice-notes`
   - `proposal-pdfs`
   - `proposal-signatures`

---

## 3️⃣ Configure Environment (30 sec)

```bash
cp .env.local.example .env.local
```

Edit `.env.local` - paste your Supabase values:

```bash
DATABASE_URL="postgresql://postgres:PASSWORD@db.XXX.supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@db.XXX.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://XXX.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 4️⃣ Setup Database (1 min)

```bash
npm run db:push      # Create tables
npm run db:seed      # Load 10 templates
```

---

## 5️⃣ Run It! (30 sec)

```bash
npm run dev
```

Open http://localhost:3000 → **Sign up** → Start creating!

---

## 🚀 Deploy to Vercel (Optional - 3 min)

1. Push to GitHub (already done)
2. Go to https://vercel.com
3. **New Project** → Import `n8n-heroku`
4. **Root Directory:** `wp-ai`
5. **Add Environment Variables** (copy from `.env.local`)
6. **Deploy**

Update `NEXT_PUBLIC_APP_URL` in Vercel settings to your production URL.

---

## ✅ You're Done!

- 📋 **10 templates** ready to use
- 📱 **Mobile-first** design
- ⚡ **Quick-edit** (2 taps)
- 🤖 **AI pricing** (add API key later)

**Need help?** See `COMPLETE_SETUP.md` for detailed guide.
