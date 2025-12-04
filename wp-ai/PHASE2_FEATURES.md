# W&P AI - Phase 2 Features Guide

Complete guide to all advanced features now available in W&P AI.

---

## 🎯 Overview

Phase 2 adds **7 powerful features** plus a comprehensive **Templates System** to transform W&P AI from an MVP into a complete client-facing platform.

### What's New

1. **📸 Photo Uploads** - Capture and attach photos during walkthroughs
2. **🎤 Voice Transcription** - Record voice notes with automatic transcription
3. **🌐 Client Portal** - Shareable public proposal links
4. **📄 PDF Generation** - Professional downloadable proposals
5. **📧 Email Sending** - Automated proposal delivery
6. **🤖 AI Pricing** - Claude-powered pricing suggestions
7. **✍️ E-Signature** - Digital proposal signing
8. **📋 Templates System** - Reusable templates for everything

---

## 📋 Templates System

### The Problem It Solves

Creating proposals from scratch is time-consuming. Templates let you:
- Save common proposal structures
- Reuse facility layouts for similar buildings
- Store pre-written content blocks
- Start new proposals in seconds instead of minutes

### Template Types

#### 1. **Proposal Templates**
Save complete proposal layouts with pre-filled content.

**Includes:**
- Introduction text
- Scope of work
- Terms & conditions
- Visual styling (layout, colors)

**Use Cases:**
- Standard proposal (general clients)
- Premium proposal (high-value clients)
- Quick quote (fast turnaround)

#### 2. **Walkthrough Templates**
Pre-configured room layouts for different facility types.

**Includes:**
- Facility type (office, medical, retail, etc.)
- Pre-defined rooms with default times
- Service frequency settings
- Square footage estimates

**Default Templates:**
- **Standard Office Building**: Lobby, conference rooms, offices, restrooms, hallways
- **Medical Facility**: Waiting room, exam rooms, break room
- **Retail Store**: Sales floor, stock room, employee areas

#### 3. **Content Templates**
Reusable text blocks you can insert anywhere.

**Categories:**
- Scope of Work additions
- Terms & Conditions clauses
- Special requirements

**Default Templates:**
- Green Cleaning Clause
- COVID-19 Safety Protocol
- Price Lock Guarantee
- Quality Guarantee

### How to Use Templates (Mobile-Optimized)

#### **Creating a Proposal from Template:**

1. **Tap "New Walkthrough"**
2. **Tap "Use Template"** button (big, easy to hit)
3. **Select facility type** from bottom sheet
4. **Template loads instantly** with all rooms pre-configured
5. **Customize** (add/remove rooms, adjust times)
6. **Generate proposal** with pre-filled content

**Time Saved:** ~5 minutes per proposal

#### **Quick Edit on Mobile:**

1. **Open any proposal**
2. **Tap floating action button** (bottom-right)
3. **Tap "Edit"**
4. **Quick-edit modal** slides up from bottom
5. **Two tabs**:
   - **Pricing**: Adjust rate with large touch targets
   - **Content**: Edit text with full keyboard
6. **Save** with one tap

**Total Clicks:** 3 clicks to edit, 1 to save = **4 clicks total**

#### **Applying Template Content:**

1. **In proposal edit mode**
2. **Tap text field** (Introduction, Scope, Terms)
3. **"Insert Template" button** appears
4. **Select content block**
5. **Content inserted** automatically

---

## 📸 Photo Uploads

### What It Does

Capture photos during walkthroughs and attach them to:
- Specific rooms
- Overall walkthrough
- Proposals (automatically included)

### How It Works

**API:** `POST /api/upload/photo`

```typescript
// Upload photo
const formData = new FormData()
formData.append('file', photoFile)
formData.append('walkthroughId', id)
formData.append('roomId', roomId) // Optional
formData.append('caption', 'Cracked tile in restroom') // Optional

const response = await fetch('/api/upload/photo', {
  method: 'POST',
  body: formData,
})
```

**Storage:** Supabase Storage bucket `walkthrough-photos`

**Features:**
- Direct camera access on mobile
- Auto-upload to cloud storage
- Attach captions
- Display in proposals
- Delete anytime

**Usage:**
1. During walkthrough, tap camera icon
2. Take photo or select from gallery
3. Add optional caption
4. Photo automatically attached
5. Appears in proposal view

---

## 🎤 Voice Transcription

### What It Does

Record voice notes during walkthroughs. Audio is automatically transcribed to text using OpenAI Whisper.

### How It Works

**API:** `POST /api/upload/voice`

```typescript
// Upload voice note
const formData = new FormData()
formData.append('file', audioBlob)
formData.append('walkthroughId', id)

const response = await fetch('/api/upload/voice', {
  method: 'POST',
  body: formData,
})

// Response includes transcription
const { transcription, audioUrl } = await response.json()
```

**Features:**
- Browser-based recording
- Automatic transcription (English)
- Saved as text notes
- Audio file stored for reference
- Hands-free data entry

**Usage:**
1. Tap microphone button
2. Speak notes (e.g., "North restroom needs extra attention, grout is stained")
3. Stop recording
4. Transcription appears automatically
5. Saved to walkthrough notes

**Pro Tip:** Use voice notes while walking through the facility instead of typing. Much faster on mobile!

---

## 🌐 Client Portal

### What It Does

Generate public shareable links for proposals. Clients can view proposals without logging in.

### Features

- **Public URL**: `your-app.com/p/abc123xyz`
- **No login required** for clients
- **View tracking**: See when client opens it
- **Visit count**: Track engagement
- **Mobile-optimized** proposal view
- **Professional layout**

### How It Works

**Generate Public URL:**
```typescript
POST /api/proposals/[id]/share
// Returns: { publicUrl, fullUrl }
```

**Revoke Access:**
```typescript
DELETE /api/proposals/[id]/share
// Removes public URL
```

**What Clients See:**
- Company branding
- Proposal title & pricing
- Full scope of work
- Room breakdown
- Terms & conditions
- Contact information

**Tracked Metrics:**
- First viewed date
- Total view count
- Time spent on page
- Device type

**Usage:**
1. Create proposal
2. Tap "Share" button
3. Public link generated
4. Send link to client via email/text
5. Track when they view it

---

## 📄 PDF Generation

### What It Does

Generate professional PDF documents of proposals for download, printing, or emailing.

### Features

- **Professional layout** with your branding
- **Automatic formatting** (no design work needed)
- **Includes all sections**: pricing, rooms, terms
- **Downloadable** for offline viewing
- **Printable** for in-person meetings
- **Stored in cloud** for future access

### How It Works

**API:** `GET /api/proposals/[id]/pdf`

```typescript
// Download PDF
window.open(`/api/proposals/${proposalId}/pdf`, '_blank')
```

**PDF Contents:**
- Header with company name
- Proposal title
- Client information
- Pricing breakdown (large, clear)
- Monthly statistics
- Introduction
- Scope of work
- Room-by-room breakdown
- Terms & conditions
- Footer with contact info
- Page numbers

**Storage:** Saved to Supabase Storage bucket `proposal-pdfs`

**Usage:**
1. Open proposal
2. Tap "Download PDF" button
3. PDF generates in ~2 seconds
4. Opens in new tab / downloads
5. Share via email or print

---

## 📧 Email Sending

### What It Does

Send proposals directly to clients via email with beautiful HTML templates.

### Features

- **Professional email template**
- **Branded header** with your company info
- **Pricing highlight** (big, visual)
- **Direct link** to view full proposal
- **Custom message** option
- **Delivery tracking**

### How It Works

**API:** `POST /api/proposals/[id]/send`

```typescript
await fetch(`/api/proposals/${id}/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'client@example.com',
    message: 'Looking forward to working with you!',
  }),
})
```

**Email Contents:**
- Subject: "Proposal: [Title]"
- Company branding
- Personalized greeting
- Custom message (optional)
- Pricing callout
- "View Full Proposal" button
- What's included (bullet points)
- Contact information

**Auto-Updates:**
- Proposal status → "sent"
- sentAt timestamp recorded
- Activity tracked
- Public URL auto-generated

**Usage:**
1. Open proposal
2. Tap "Send" button
3. Enter client email (or use saved contact)
4. Add optional message
5. Tap "Send Proposal"
6. Client receives email instantly

**Email Provider:** Resend (free tier: 100 emails/day)

---

## 🤖 AI Pricing Suggestions

### What It Does

Claude AI analyzes your walkthrough and suggests an optimal customer rate based on:
- Facility type and size
- Your historical win/loss data
- Market positioning
- Your target margin

### Features

- **Intelligent pricing** based on real data
- **Confidence score** (0-100%)
- **Reasoning** explaining the suggestion
- **Similar projects** comparison
- **Projected metrics** (profit, margin)
- **Learning system** (improves over time)

### How It Works

**API:** `POST /api/ai/pricing-suggestion`

```typescript
const response = await fetch('/api/ai/pricing-suggestion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walkthroughId: id,
    proposalId: proposalId, // Optional, to save suggestion
  }),
})

const {
  suggestedRate, // e.g., 42.5
  confidence, // e.g., 85
  reasoning, // AI explanation
  similarProjects, // Historical comparisons
  projectedMetrics, // What the numbers would be
} = await response.json()
```

**What Claude Analyzes:**
- Facility type (office, medical, etc.)
- Total square footage
- Number of rooms
- Service frequency
- Your labor cost
- Your target margin
- Past proposals (won/lost)
- Pricing patterns

**Example Output:**
```json
{
  "suggestedRate": 45.00,
  "confidence": 87,
  "reasoning": "Based on 3 similar office buildings you've won, this rate provides a healthy 35% margin while remaining competitive. Your average winning rate for this facility type is $43/hr.",
  "similarProjects": [
    "Standard Office Building - $42/hr - won (33% margin)",
    "Office Complex Downtown - $48/hr - won (38% margin)"
  ],
  "projectedMetrics": {
    "monthlyPrice": 2025.00,
    "profit": 708.75,
    "profitMargin": 35.0
  }
}
```

**Usage:**
1. Create walkthrough
2. On pricing page, tap "Get AI Suggestion"
3. AI analyzes in ~3 seconds
4. See suggested rate with confidence %
5. Read reasoning
6. **Accept or override**
7. Provide feedback (helps AI learn)

**Feedback Loop:**
- Mark if you accepted/rejected
- When proposal wins/loses, AI learns
- Future suggestions improve

**AI Provider:** Anthropic Claude 3.5 Sonnet

---

## ✍️ E-Signature

### What It Does

Clients can digitally sign proposals directly from the public link. No third-party tools needed.

### Features

- **Touch-friendly** signature pad
- **Canvas-based** drawing
- **Signer information** captured
- **Timestamp** recorded
- **Signature image** stored
- **Auto-updates** proposal to "won"
- **Legal record** maintained

### How It Works

**API:** `POST /api/proposals/[id]/sign`

```typescript
// Client signs proposal
await fetch(`/api/proposals/${id}/sign`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    signatureDataUrl: canvasDataURL, // base64 image
    signerName: 'John Smith',
    signerEmail: 'john@client.com',
    publicUrl: 'abc123xyz', // If signing from public view
  }),
})
```

**Stored Data:**
- Signature image (PNG)
- Signer name
- Signer email
- Timestamp
- IP address (optional)

**Auto-Actions on Sign:**
- Proposal status → "won"
- signedAt timestamp
- Activity logged
- Notification sent (future)

**Client Experience:**
1. Opens public proposal link
2. Reviews proposal
3. Taps "Sign Proposal" button
4. Signature pad appears (fullscreen)
5. Draws signature with finger/mouse
6. Enters name & email
7. Taps "Submit Signature"
8. Confirmation screen
9. You get notification

**Your View:**
- See signed proposals in dashboard
- View signature image
- Download signed PDF
- Export records

**Library:** react-signature-canvas

---

## 🎨 Mobile-First Quick Edit

### The Challenge

Editing proposals on mobile is typically painful:
- Too many clicks
- Small buttons
- Tiny text fields
- Awkward navigation
- Page reloads

### Our Solution: **2-Tap Quick Edit**

#### **Tap 1:** Floating Action Button
- Always visible (bottom-right corner)
- Large touch target (56x56px)
- Opens action menu

#### **Tap 2:** Edit Button
- Slide-up modal
- Full-screen editor
- Large fields

#### **Features:**

**Pricing Tab:**
- HUGE rate input ($$ size)
- Quick multiplier buttons (1.35x, 1.5x, 1.75x, 2x)
- AI suggestion button (one tap)
- Live profit calculation

**Content Tab:**
- Large text areas
- Auto-save
- Template insertion
- No scrolling issues

**Total Interaction:**
```
Tap FAB (1) → Tap Edit (2) → Make changes → Save (1) = 3 taps total
```

**vs. Traditional:**
```
Menu (1) → Edit (2) → Navigate (3) → Field (4) → Scroll (5) → Save (6) = 6+ taps
```

**50% fewer taps!**

---

## 📱 Usage Examples

### Example 1: Create Proposal from Template (Mobile)

**Time: 45 seconds**

1. Tap "New Walkthrough" (1 tap)
2. Select client (1 tap)
3. Tap "Use Template" (1 tap)
4. Select "Standard Office Building" (1 tap)
5. Template loads with 7 pre-configured rooms
6. Adjust one room time (1 tap to edit, type new time)
7. Tap "Next" (1 tap)
8. Review pricing
9. Tap "Generate Proposal" (1 tap)
10. Done!

**Total: 7 taps, 45 seconds**

**Without template: 20+ taps, 5+ minutes**

---

### Example 2: Quick Edit Pricing on Phone

**Time: 10 seconds**

1. Open proposal
2. Tap FAB (floating button) (1 tap)
3. Tap "Edit" (1 tap)
4. Tap "Pricing" tab (1 tap)
5. Tap "1.5x" multiplier button (1 tap) - rate updates
6. Tap "Save" (1 tap)

**Total: 5 taps, 10 seconds**

---

### Example 3: Send Proposal to Client

**Time: 15 seconds**

1. Open proposal
2. Tap FAB (1 tap)
3. Tap "Send" (1 tap)
4. Email auto-filled from client record
5. Add message: "Looking forward to working together!"
6. Tap "Send Proposal" (1 tap)
7. Client receives email instantly
8. Public URL auto-generated
9. You get confirmation

**Total: 3 taps, 15 seconds**

---

## 🔧 Setup Instructions

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# AI Features
ANTHROPIC_API_KEY="sk-ant-..."  # Get from console.anthropic.com
OPENAI_API_KEY="sk-..."         # Get from platform.openai.com

# Email
RESEND_API_KEY="re_..."         # Get from resend.com

# Already configured:
# - DATABASE_URL
# - SUPABASE credentials
# - NEXT_PUBLIC_APP_URL
```

### 2. Supabase Storage Buckets

Create these public buckets in Supabase Dashboard:

1. **walkthrough-photos**
   - Public access
   - Max file size: 5MB
   - Allowed types: image/*

2. **voice-notes**
   - Public access
   - Max file size: 10MB
   - Allowed types: audio/*

3. **proposal-pdfs**
   - Public access
   - Max file size: 5MB
   - Allowed types: application/pdf

4. **proposal-signatures**
   - Public access
   - Max file size: 1MB
   - Allowed types: image/png

### 3. Database Migration

```bash
npm run db:push
npm run db:seed
```

This creates:
- Template models
- Default templates (3 walkthrough, 3 proposal, 4 content)
- Demo data

### 4. Test Features

1. **Templates:** Visit `/templates` to see default templates
2. **Photo Upload:** Create walkthrough, use camera icon
3. **Voice Notes:** Record a voice note in walkthrough
4. **AI Pricing:** Create walkthrough, tap "Get AI Suggestion"
5. **Client Portal:** Share a proposal, copy public link
6. **PDF:** Download a proposal as PDF
7. **Email:** Send proposal to your email
8. **E-Signature:** Sign from public link

---

## 💰 Cost Breakdown

### Monthly Costs (Low Usage)

| Service | Usage | Cost |
|---------|-------|------|
| Supabase | 2GB storage, 50GB bandwidth | $0 (Free tier) |
| Anthropic Claude | 100 AI suggestions/mo | ~$5 |
| OpenAI Whisper | 50 voice notes/mo | ~$3 |
| Resend | 100 emails/mo | $0 (Free tier) |
| Vercel | Hosting | $0 (Free tier) |
| **TOTAL** | | **~$8/month** |

### Monthly Costs (Medium Usage - 50 proposals/month)

| Service | Usage | Cost |
|---------|-------|------|
| Supabase | 10GB storage, 200GB bandwidth | $25 (Pro plan) |
| Anthropic Claude | 500 AI suggestions/mo | ~$25 |
| OpenAI Whisper | 200 voice notes/mo | ~$12 |
| Resend | 500 emails/mo | $0 (Free tier) |
| Vercel | Hosting | $20 (Pro plan) |
| **TOTAL** | | **~$82/month** |

### Tips to Reduce Costs

1. **AI Pricing:** Only use when needed (not every proposal)
2. **Voice Transcription:** Use for complex notes, type short ones
3. **Photos:** Compress before upload
4. **Email:** Use Resend free tier (3,000/month)
5. **Supabase:** Clean up old proposals regularly

---

## 📊 Feature Comparison

| Feature | MVP (Phase 1) | Phase 2 |
|---------|--------------|---------|
| Create walkthrough | ✅ Manual | ✅ + Templates |
| Pricing calculator | ✅ Manual | ✅ + AI Suggestions |
| Proposals | ✅ View only | ✅ + PDF + Share + Edit |
| Client access | ❌ | ✅ Public portal |
| Photos | ❌ | ✅ Upload + Storage |
| Voice notes | ❌ | ✅ Record + Transcribe |
| Email sending | ❌ | ✅ Branded emails |
| E-signature | ❌ | ✅ Digital signing |
| Templates | ❌ | ✅ Proposals + Facilities + Content |
| Mobile editing | ⚠️ Basic | ✅ Quick-edit (2 taps) |

---

## 🚀 Next Steps

1. **Configure environment variables**
2. **Set up Supabase buckets**
3. **Run database migration**
4. **Create your first template**
5. **Try the quick-edit flow**
6. **Send a test proposal**
7. **Deploy to production**

---

## 📚 Additional Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Anthropic Claude API](https://docs.anthropic.com)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Resend Email API](https://resend.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Questions? Issues?**

Open an issue on GitHub or check the troubleshooting section in `SETUP.md`.

**Built with ❤️ using Next.js 14, TypeScript, and Claude AI**
