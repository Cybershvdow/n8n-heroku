# W&P AI - Health Check & Validation

Run these checks before deployment to ensure everything works correctly.

## ✅ Pre-Flight Checklist

### 1. Dependencies
```bash
cd wp-ai
npm install
```
**Expected**: No errors, all packages installed

### 2. TypeScript Compilation
```bash
npx tsc --noEmit
```
**Expected**: No type errors

### 3. Build Test
```bash
npm run build
```
**Expected**: Build completes successfully

### 4. Linting
```bash
npm run lint
```
**Expected**: No ESLint errors

### 5. Environment Variables
```bash
# Check .env.local exists
ls -la .env.local

# Verify required variables are set
cat .env.local | grep -E "DATABASE_URL|SUPABASE_URL|SUPABASE_ANON_KEY"
```
**Expected**: All required variables present

### 6. Database Connection
```bash
npm run db:push
```
**Expected**: Schema synced successfully

### 7. Database Seed (Optional)
```bash
npm run db:seed
```
**Expected**: Demo data created

### 8. Development Server
```bash
npm run dev
```
**Expected**: Server starts on port 3000

## 🧪 Manual Testing Checklist

Visit http://localhost:3000 and test:

### Authentication
- [ ] Signup page loads (`/signup`)
- [ ] Login page loads (`/login`)
- [ ] Can create new account
- [ ] Can login with credentials
- [ ] Redirects to dashboard after login
- [ ] Can logout

### Dashboard
- [ ] Dashboard shows stats
- [ ] "New Walkthrough" button works
- [ ] Bottom navigation visible
- [ ] Can navigate between tabs

### Walkthrough Creation
- [ ] Can access `/walkthroughs/new`
- [ ] Client selector works
- [ ] Can create new client
- [ ] Can select existing client
- [ ] Property form validates
- [ ] Can add rooms
- [ ] Room form shows estimated minutes
- [ ] Running total updates
- [ ] Can proceed to pricing

### Pricing Calculator
- [ ] Pricing page loads
- [ ] Calculator shows correct math
- [ ] Slider adjusts rate
- [ ] Quick multiplier buttons work
- [ ] Profit margin calculates
- [ ] Visual warnings appear when needed
- [ ] "Generate Proposal" works

### Proposals
- [ ] Proposal list loads (`/proposals`)
- [ ] Search works
- [ ] Status filters work
- [ ] Can view individual proposal
- [ ] Can change proposal status
- [ ] Can duplicate proposal
- [ ] Stats display correctly

### Settings
- [ ] Settings page loads (`/settings`)
- [ ] Can update hourly wage
- [ ] Can update target margin
- [ ] Changes save successfully
- [ ] Logout button works

### PWA
- [ ] Manifest loads (`/manifest.json`)
- [ ] Service worker registers
- [ ] App is installable
- [ ] Works offline (after install)

### Error Handling
- [ ] 404 page shows for invalid routes
- [ ] Error boundary catches errors
- [ ] API errors show user-friendly messages
- [ ] Loading states show during async operations

## 🐛 Common Issues & Fixes

### Issue: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Prisma Client not generated"
```bash
npx prisma generate
```

### Issue: "Database connection failed"
- Check DATABASE_URL in .env.local
- Verify database is running
- Test connection with: `psql $DATABASE_URL`

### Issue: "Auth callback error"
- Verify Supabase redirect URLs
- Check environment variables
- Clear browser cookies

### Issue: "Type errors on build"
```bash
npx tsc --noEmit
# Fix reported errors
```

### Issue: "PWA not installing"
- Must be HTTPS (except localhost)
- Check manifest.json is accessible
- Verify service worker registered
- Try incognito mode

## 📊 Performance Checks

### Bundle Size
```bash
npm run build
# Check .next/analyze output
```
**Target**: < 500KB initial load

### Lighthouse Score
1. Open Chrome DevTools
2. Run Lighthouse audit
3. Check scores:
   - Performance: > 90
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90
   - PWA: ✓ Installable

### Database Queries
```bash
npm run db:studio
```
- Check for N+1 queries
- Verify indexes exist
- Review slow queries

## 🔒 Security Checks

### Environment Variables
- [ ] No secrets in code
- [ ] .env.local in .gitignore
- [ ] Service role key not exposed to client
- [ ] API routes check authentication

### API Routes
```bash
# Test unauthorized access
curl http://localhost:3000/api/proposals
# Should return 401
```

### Dependencies
```bash
npm audit
npm audit fix
```

### CORS
- [ ] API routes only accept expected origins
- [ ] No wildcard (*) CORS in production

## 📱 Mobile Testing

### iOS Safari
- [ ] App loads correctly
- [ ] Touch targets > 44px
- [ ] No horizontal scroll
- [ ] Install prompt appears
- [ ] Works offline after install

### Android Chrome
- [ ] App loads correctly
- [ ] Touch targets > 48dp
- [ ] No horizontal scroll
- [ ] Install prompt appears
- [ ] Works offline after install

### Responsive Design
Test at breakpoints:
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12/13)
- [ ] 414px (iPhone Plus)
- [ ] 768px (iPad)
- [ ] 1024px (iPad Pro)
- [ ] 1440px (Desktop)

## ✅ Production Ready Checklist

Before deploying:
- [ ] All health checks pass
- [ ] All manual tests complete
- [ ] No console errors
- [ ] No console warnings (except expected)
- [ ] Performance acceptable
- [ ] Security audit clean
- [ ] Mobile tested on real devices
- [ ] Database backed up
- [ ] Environment variables configured
- [ ] Domain/SSL configured
- [ ] Monitoring set up
- [ ] Error tracking configured

## 🚀 Post-Deployment Validation

After deploying:
- [ ] Production URL accessible
- [ ] Can create account
- [ ] Can login
- [ ] Can create walkthrough
- [ ] Can generate proposal
- [ ] PWA installable
- [ ] All features work
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Mobile works correctly

---

## 📝 Test User Credentials (Demo Data)

If you ran `npm run db:seed`:

**Email**: demo@wpai.app
**Password**: (Set manually in Supabase Auth)

**Demo data includes**:
- 3 clients
- 1 walkthrough (8 rooms)
- 3 proposals (different statuses)

---

**Pass Rate Target**: 100% ✅

If any checks fail, fix before deploying to production!
