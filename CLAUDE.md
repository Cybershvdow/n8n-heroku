# W&P AI - Build Specification

## PROJECT OVERVIEW
Build a mobile-first PWA (Progressive Web App) for janitorial proposal generation with AI-powered pricing suggestions.

**Name:** W&P AI (Walkthroughs & Proposals)
**Platform:** Next.js 14 PWA (mobile-first, works on web too)
**Design:** Dark mode with neon lime accents (reference: modern solar panel app aesthetic)

---

## TECH STACK
```yaml
Frontend:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Framer Motion (animations)

Backend:
  - Next.js API Routes
  - Supabase (PostgreSQL + Auth + Storage)
  - Prisma ORM

AI:
  - Anthropic Claude API (proposal generation, pricing suggestions)
  - OpenAI Whisper API (voice transcription)

PDF:
  - @react-pdf/renderer

Deployment:
  - Vercel
```

---

## DESIGN SYSTEM

### Colors
```css
Primary Background: #0A0E1A (dark navy)
Card Background: #1A1F2E (dark gray with 80% opacity)
Border: #2D3748 (subtle gray)

Accent - Neon Lime: #D4FF00 (main CTA color)
Accent - Green: #10B981
Accent - Blue: #0EA5E9
Accent - Purple: #8B5CF6
Accent - Orange: #FF6B2C

Text Primary: #FFFFFF
Text Secondary: #94A3B8
Text Muted: #64748B
```

### Typography
- Font: Inter (body), Space Grotesk (headings)
- Mobile-first: readable on small screens
- Bold numbers for key metrics

### UI Style
- Glassmorphism cards (frosted glass effect)
- Circular progress indicators
- Bottom tab navigation (mobile)
- Smooth slide transitions
- Minimal headers, clean spacing
- Large touch targets (44px minimum)

---

## DATABASE SCHEMA
```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String
  company       String?
  phone         String?
  createdAt     DateTime  @default(now())

  hourlyWage    Float     @default(20.00)
  targetMargin  Float     @default(0.30)

  clients       Client[]
  walkthroughs  Walkthrough[]
  proposals     Proposal[]
  pricingRules  PricingRule[]
}

model Client {
  id            String    @id @default(uuid())
  name          String
  contactName   String?
  email         String?
  phone         String?
  address       String?
  createdAt     DateTime  @default(now())

  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  walkthroughs  Walkthrough[]
  proposals     Proposal[]
}

model Walkthrough {
  id                String    @id @default(uuid())
  clientId          String
  propertyAddress   String
  totalSqft         Float?
  facilityType      String?
  serviceFrequency  String    @default("daily")
  daysPerWeek       Int       @default(5)
  status            String    @default("draft")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  client            Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  rooms             Room[]
  photos            Photo[]
  voiceNotes        VoiceNote[]
  notes             Note[]
  proposal          Proposal?

  userId            String
}

model Room {
  id                String    @id @default(uuid())
  walkthroughId     String
  name              String
  roomType          String
  squareFeet        Float?
  floorType         String?
  estimatedMinutes  Int
  specialNotes      String?
  createdAt         DateTime  @default(now())

  walkthrough       Walkthrough @relation(fields: [walkthroughId], references: [id], onDelete: Cascade)
  photos            Photo[]
}

model Photo {
  id                String    @id @default(uuid())
  walkthroughId     String
  roomId            String?
  url               String
  caption           String?
  createdAt         DateTime  @default(now())

  walkthrough       Walkthrough @relation(fields: [walkthroughId], references: [id], onDelete: Cascade)
  room              Room?     @relation(fields: [roomId], references: [id], onDelete: Cascade)
}

model VoiceNote {
  id                String    @id @default(uuid())
  walkthroughId     String
  audioUrl          String
  transcription     String?
  duration          Int?
  createdAt         DateTime  @default(now())

  walkthrough       Walkthrough @relation(fields: [walkthroughId], references: [id], onDelete: Cascade)
}

model Note {
  id                String    @id @default(uuid())
  walkthroughId     String
  content           String
  createdAt         DateTime  @default(now())

  walkthrough       Walkthrough @relation(fields: [walkthroughId], references: [id], onDelete: Cascade)
}

model Proposal {
  id                String    @id @default(uuid())
  walkthroughId     String    @unique
  clientId          String
  title             String

  totalMonthlyHours Float
  laborCost         Float
  customerRate      Float
  monthlyPrice      Float
  profitMargin      Float

  introduction      String?   @db.Text
  scopeOfWork       String?   @db.Text
  termsConditions   String?   @db.Text

  status            String    @default("draft")
  category          String?
  tags              String[]

  sentAt            DateTime?
  viewedAt          DateTime?
  viewCount         Int       @default(0)
  downloadCount     Int       @default(0)
  signedAt          DateTime?

  publicUrl         String?   @unique
  pdfUrl            String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  walkthrough       Walkthrough @relation(fields: [walkthroughId], references: [id], onDelete: Cascade)
  client            Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  activities        ProposalActivity[]
  aiSuggestion      AISuggestion?

  userId            String
}

model ProposalActivity {
  id                String    @id @default(uuid())
  proposalId        String
  activityType      String
  metadata          Json?
  createdAt         DateTime  @default(now())

  proposal          Proposal  @relation(fields: [proposalId], references: [id], onDelete: Cascade)
}

model PricingRule {
  id                String    @id @default(uuid())
  userId            String
  roomType          String
  estimatedMinutes  Int
  description       String?
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AISuggestion {
  id                String    @id @default(uuid())
  proposalId        String    @unique
  suggestedRate     Float
  confidence        Float
  reasoning         String    @db.Text
  similarProjects   Json?
  userAccepted      Boolean?
  userFeedback      String?
  createdAt         DateTime  @default(now())

  proposal          Proposal  @relation(fields: [proposalId], references: [id], onDelete: Cascade)
}
```

---

## CORE FEATURES TO BUILD

### Phase 1: Foundation (Build First)
1. **Authentication**
   - Simple email/password login
   - Supabase Auth integration
   - Redirect to dashboard after login

2. **Dashboard** (Home Screen)
   - Recent walkthroughs list
   - Quick stats (proposals sent, win rate)
   - "New Walkthrough" CTA button
   - Bottom tab navigation

3. **New Walkthrough Flow**
   - Client selection/creation
   - Property address input
   - Room capture interface:
     - Photo upload
     - Voice recording
     - Text notes
     - Room type selector (kitchen, restroom, office, lobby, etc.)
     - Square footage (optional)
   - Each room shows estimated cleaning time
   - Running total of hours displayed

4. **Pricing Calculator**
   - Show total monthly hours
   - Labor cost calculation: `employeeWage × hours × 4.33`
   - Customer rate input field (user types $/hour)
   - Live calculation of:
     - Monthly revenue
     - Profit
     - Profit margin %
   - Simple slider to adjust customer rate
   - Show suggested rates: 2x, 1.75x, 1.5x employee wage

5. **Proposal Generation**
   - "Generate Proposal" button
   - Creates proposal with:
     - Client info
     - Pricing breakdown
     - Basic scope of work
   - Save as draft or send

6. **Proposal List**
   - View all proposals
   - Filter by status (draft, sent, won, lost)
   - Search by client name
   - Duplicate button on each proposal

### Phase 2: Advanced (Add Later)
- AI pricing suggestions using Claude API
- AI learning from won/lost bids
- Rich text editor for proposal sections
- PDF generation
- Client portal (public proposal view)
- Email/SMS sending
- E-signature

---

## PRICING FORMULA
```typescript
// Core calculation
interface PricingCalc {
  employeeHourlyWage: number;     // e.g., $20/hr (from user settings)
  totalDailyMinutes: number;      // sum of all room times
  daysPerWeek: number;            // e.g., 5
  customerRate: number;           // $/hr user sets

  // Calculations
  totalHoursPerDay = totalDailyMinutes / 60;
  totalHoursPerMonth = totalHoursPerDay × daysPerWeek × 4.33;

  laborCost = employeeHourlyWage × totalHoursPerMonth;
  monthlyRevenue = customerRate × totalHoursPerMonth;

  profit = monthlyRevenue - laborCost;
  profitMargin = (profit / monthlyRevenue) × 100;
}

// Default room times (minutes)
const ROOM_DEFAULTS = {
  kitchen: 30,
  restroom: 30,
  office_small: 15,
  office_medium: 25,
  office_large: 40,
  lobby: 45,
  conference: 20,
  hallway: 10,
};
```

---

## KEY USER FLOWS

### Flow: Create Proposal
1. User taps "New Walkthrough"
2. Selects client (or creates new)
3. Enters property address
4. For each room:
   - Takes photo
   - Selects room type
   - App shows estimated time
   - Can adjust time manually
5. Reviews total hours
6. Sets customer rate ($/hour)
7. Sees pricing breakdown
8. Taps "Generate Proposal"
9. Reviews proposal
10. Sends to client

### Flow: Duplicate Proposal
1. User views existing proposal
2. Taps "Duplicate"
3. Enters new client name
4. Reviews/adjusts pricing
5. Sends

---

## MOBILE UI STRUCTURE
```
App Layout:
┌─────────────────────────────────┐
│  Top Bar (logo, profile)        │
├─────────────────────────────────┤
│                                 │
│  Main Content Area              │
│  (scrollable)                   │
│                                 │
│                                 │
├─────────────────────────────────┤
│  Bottom Navigation              │
│  [Home] [📸] [Docs] [⚙️]       │
└─────────────────────────────────┘

Bottom Nav Icons:
- Home: Dashboard
- Camera: New Walkthrough
- Docs: Proposals List
- Settings: User Settings & Pricing Rules
```

---

## ENVIRONMENT VARIABLES NEEDED
```bash
# .env.local
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## IMMEDIATE BUILD TASKS

**Start with these in order:**

1. ✅ Initialize Next.js 14 project with TypeScript
2. ✅ Setup Tailwind with custom dark theme colors
3. ✅ Setup Supabase connection
4. ✅ Setup Prisma with schema above
5. ✅ Create basic auth flow (login/signup)
6. ✅ Build bottom navigation component
7. ✅ Build dashboard with "New Walkthrough" button
8. ✅ Build walkthrough form:
   - Client selector
   - Room capture (photo + room type + time)
   - Running hours total
9. ✅ Build pricing calculator component
10. ✅ Build proposal list view
11. ✅ Implement duplicate functionality

**Don't build yet (Phase 2):**
- AI integration
- PDF generation
- Email sending
- Client portal
- Rich text editor

---

## DESIGN REFERENCE

The UI should look like the uploaded solar panel app:
- Dark background (#0A0E1A)
- Glassmorphism cards
- Neon lime (#D4FF00) for primary actions
- Circular progress indicators
- Clean, minimal design
- Large touch targets
- Bottom navigation

---

## SUCCESS CRITERIA

**MVP is complete when:**
1. User can login
2. User can create walkthrough with rooms
3. User can see pricing calculation
4. User can generate basic proposal
5. User can view all proposals
6. User can duplicate proposals
7. App works on mobile browser
8. App is installable as PWA

---

## NOTES

- Build mobile-first, desktop is secondary
- Keep UI simple and fast
- No supply costs in formula (labor only)
- User manually sets customer rate ($/hour)
- Profit margin is calculated, not set
- Focus on speed - proposals in <5 minutes
