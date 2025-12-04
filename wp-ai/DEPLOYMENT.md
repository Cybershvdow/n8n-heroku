# Deployment Checklist

Complete these steps before deploying to production.

## Pre-Deployment Checklist

### ✅ Environment Setup

- [ ] All environment variables configured in Vercel/hosting platform
- [ ] Database URL points to production database
- [ ] Supabase production project created
- [ ] Auth redirect URLs updated with production domain
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL

### ✅ Database

- [ ] Production database created
- [ ] Schema pushed: `npx prisma db push`
- [ ] Database accessible from hosting platform
- [ ] Connection pooling enabled (if using Supabase)

### ✅ Authentication

- [ ] Supabase production project configured
- [ ] Email provider enabled
- [ ] Redirect URLs include production domain
- [ ] Email templates customized (optional)
- [ ] Test signup/login flow

### ✅ Build & Testing

- [ ] Production build successful: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No ESLint errors: `npm run lint`
- [ ] Test all critical paths:
  - [ ] Sign up / Login
  - [ ] Create walkthrough
  - [ ] Generate proposal
  - [ ] View proposals
  - [ ] Update settings

### ✅ PWA

- [ ] Icons generated (192x192 and 512x512)
- [ ] `manifest.json` configured
- [ ] Service worker tested
- [ ] HTTPS enabled (required for PWA)

### ✅ Security

- [ ] `.env.local` NOT committed to Git
- [ ] Service role keys kept secure
- [ ] API routes protected with auth checks
- [ ] Database queries use user ID filtering

### ✅ Performance

- [ ] Images optimized
- [ ] Unused dependencies removed
- [ ] Bundle size checked
- [ ] Database indexed properly

---

## Vercel Deployment Steps

### 1. Prepare Repository

```bash
git add .
git commit -m "Production ready"
git push
```

### 2. Deploy to Vercel

#### Via Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select repository
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `./` (or `wp-ai` if in subdirectory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Via CLI
```bash
npm i -g vercel
vercel
```

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. Update Supabase

In Supabase Dashboard → Authentication → URL Configuration:

Add redirect URL:
```
https://your-app.vercel.app/auth/callback
```

### 5. Deploy Database Schema

```bash
# Set DATABASE_URL to production
export DATABASE_URL="postgresql://..."

# Push schema
npx prisma db push

# (Optional) Seed data
npx prisma db seed
```

### 6. Test Deployment

- [ ] Visit your app URL
- [ ] Test sign up
- [ ] Create a walkthrough
- [ ] Generate proposal
- [ ] Test on mobile device
- [ ] Try installing as PWA

---

## Post-Deployment

### Monitor

- Check Vercel logs for errors
- Monitor database performance
- Check Supabase auth logs

### Custom Domain (Optional)

1. In Vercel → Settings → Domains
2. Add your domain
3. Update DNS records
4. Update `NEXT_PUBLIC_APP_URL`
5. Update Supabase redirect URLs

### Analytics (Optional)

Add Vercel Analytics:
```bash
npm install @vercel/analytics
```

Update `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## Troubleshooting Production Issues

### Build Fails

**Error**: "Build failed"

- Check build logs in Vercel
- Try local build: `npm run build`
- Verify all imports are correct
- Check TypeScript errors

### Database Connection Issues

**Error**: "Can't connect to database"

- Verify `DATABASE_URL` in environment variables
- Check database is accessible from Vercel (whitelist IPs)
- Try connection pooling URL
- Use `DIRECT_URL` for migrations

### Auth Issues

**Error**: "Auth callback failed"

- Verify redirect URLs match exactly
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Ensure environment variables are set in production
- Clear browser cache and try again

### 500 Errors

- Check Vercel function logs
- Verify API routes have proper error handling
- Check database queries for errors
- Ensure all environment variables are set

---

## Rollback Plan

If something goes wrong:

1. **Revert Deployment**
   - In Vercel → Deployments
   - Find last working deployment
   - Click "Promote to Production"

2. **Database Rollback**
   - If you have backups: restore from backup
   - If using Supabase: Point-in-time recovery available

3. **Fix & Redeploy**
   - Fix the issue locally
   - Test thoroughly
   - Deploy again

---

## Production Best Practices

### Regular Maintenance

- [ ] Monitor error logs weekly
- [ ] Review database performance
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Test critical paths after updates

### Security

- [ ] Rotate API keys every 90 days
- [ ] Review user access logs
- [ ] Keep dependencies updated
- [ ] Monitor for security advisories

### Performance

- [ ] Monitor page load times
- [ ] Check database query performance
- [ ] Optimize slow endpoints
- [ ] Consider CDN for static assets

---

## Support Resources

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma**: [prisma.io/docs](https://www.prisma.io/docs)

---

## Deployment Complete! 🎉

Your W&P AI app is now live and ready for users.

Don't forget to:
- Share the URL with your team
- Create your first real proposal
- Gather user feedback
- Plan Phase 2 features
