# LoadDesk Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOADDESK SYSTEM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         CLIENT LAYER                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    │
│  │  │   Mobile     │  │   Tablet     │  │   Desktop    │              │    │
│  │  │  (Primary)   │  │   (iPad)     │  │  (Secondary) │              │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │    │
│  │         │                 │                 │                       │    │
│  │         └─────────────────┼─────────────────┘                       │    │
│  │                           ▼                                         │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │              Next.js App (Mobile-First UI)                  │   │    │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│   │    │
│  │  │  │Dashboard│ │  Email  │ │  Calls  │ │   GPS   │ │Settings││   │    │
│  │  │  │   Tab   │ │   Tab   │ │   Tab   │ │   Tab   │ │  Tab   ││   │    │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘│   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         API LAYER (Next.js API Routes)              │    │
│  │                                                                      │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │    │
│  │  │   Auth Module    │  │   Loads Module   │  │ Integrations Mod │  │    │
│  │  │  - Register      │  │  - List/Filter   │  │  - Gmail OAuth   │  │    │
│  │  │  - Login         │  │  - Decide        │  │  - O365 OAuth    │  │    │
│  │  │  - Password      │  │  - Export        │  │  - IMAP (Future) │  │    │
│  │  │  - Sessions      │  │  - Audit         │  │  - Webhooks      │  │    │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │    │
│  │                                                                      │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │    │
│  │  │   GPS Module     │  │ Notifications Mod│  │   Org/Tenant     │  │    │
│  │  │  - Start Trip    │  │  - Create        │  │  - RBAC          │  │    │
│  │  │  - End Trip      │  │  - List          │  │  - Isolation     │  │    │
│  │  │  - Export        │  │  - Mark Read     │  │  - Roles         │  │    │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐             │
│         ▼                          ▼                          ▼             │
│  ┌─────────────────┐  ┌─────────────────────────┐  ┌─────────────────┐     │
│  │   Auth Layer    │  │    Business Logic       │  │  Email Adapters │     │
│  │  ┌───────────┐  │  │  ┌─────────────────┐   │  │  ┌───────────┐  │     │
│  │  │  Argon2   │  │  │  │ Load Processor  │   │  │  │  Gmail    │  │     │
│  │  │  Hashing  │  │  │  └─────────────────┘   │  │  │  Adapter  │  │     │
│  │  └───────────┘  │  │  ┌─────────────────┐   │  │  └───────────┘  │     │
│  │  ┌───────────┐  │  │  │ Decision Engine │   │  │  ┌───────────┐  │     │
│  │  │  Session  │  │  │  └─────────────────┘   │  │  │  O365     │  │     │
│  │  │  Manager  │  │  │  ┌─────────────────┐   │  │  │  Adapter  │  │     │
│  │  └───────────┘  │  │  │  Reply Sender   │   │  │  └───────────┘  │     │
│  │  ┌───────────┐  │  │  └─────────────────┘   │  │  ┌───────────┐  │     │
│  │  │Rate Limit │  │  │  ┌─────────────────┐   │  │  │  IMAP     │  │     │
│  │  │  Guard    │  │  │  │   AI Extractor  │   │  │  │ (Future)  │  │     │
│  │  └───────────┘  │  │  └─────────────────┘   │  │  └───────────┘  │     │
│  └─────────────────┘  └─────────────────────────┘  └─────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         DATA LAYER                                   │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │                    Prisma ORM                                 │   │    │
│  │  │         (Tenant Isolation Enforced at Query Layer)           │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  │                           │                                          │    │
│  │         ┌─────────────────┼─────────────────┐                       │    │
│  │         ▼                 ▼                 ▼                       │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐             │    │
│  │  │  PostgreSQL │  │    Redis    │  │  Encrypted Blob │             │    │
│  │  │  (Primary)  │  │  (Cache/Q)  │  │   (OAuth Keys)  │             │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      BACKGROUND JOBS (BullMQ)                        │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │    │
│  │  │ Email Polling │  │ AI Extraction │  │  Reply Queue  │            │    │
│  │  │     Job       │  │     Job       │  │     Job       │            │    │
│  │  └───────────────┘  └───────────────┘  └───────────────┘            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              EXTERNAL SERVICES
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │  Gmail API    │  │  MS Graph API │  │   OpenAI/     │                   │
│  │  (OAuth 2.0)  │  │  (OAuth 2.0)  │  │   Claude API  │                   │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│  User   │────▶│  Rate Limit │────▶│   Validate  │────▶│  Argon2  │
│ Request │     │    Guard    │     │   Input     │     │  Verify  │
└─────────┘     └─────────────┘     └─────────────┘     └────┬─────┘
                                                              │
    ┌─────────────────────────────────────────────────────────┘
    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Create    │────▶│  Set Secure │────▶│   Return    │
│   Session   │     │   Cookie    │     │   Success   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 2. Email Ingestion Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Gmail/O365  │────▶│   Webhook/   │────▶│   Classify   │
│   Mailbox    │     │    Poll      │     │   IsLoad?    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                          ┌───────┴───────┐
                                          ▼               ▼
                                    ┌──────────┐   ┌──────────┐
                                    │   Yes    │   │    No    │
                                    │ Extract  │   │  Archive │
                                    └────┬─────┘   └──────────┘
                                         │
    ┌────────────────────────────────────┘
    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  AI Extract  │────▶│   Validate   │────▶│ Create Load  │
│   Fields     │     │   JSON       │     │   Record     │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 3. Load Decision Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Dispatcher  │────▶│   Validate   │────▶│   Create     │
│   Decision   │     │   Authz      │     │  Decision    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
    ┌─────────────────────────────────────────────┘
    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Update Load  │────▶│  Queue Reply │────▶│  Send Email  │
│   Status     │     │    Job       │     │   via API    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                          ┌───────┴───────┐
                                          ▼               ▼
                                    ┌──────────┐   ┌──────────┐
                                    │ Success  │   │  Failed  │
                                    │  Record  │   │  Notify  │
                                    └──────────┘   └──────────┘
```

### 4. GPS Tracking Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Driver     │────▶│   Check      │────▶│   Start      │
│ Start Trip   │     │   Consent    │     │   Tracking   │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
    ┌─────────────────────────────────────────────┘
    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Collect    │────▶│   End Trip   │────▶│  Calculate   │
│   Points     │     │   Request    │     │   Miles      │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Security Architecture

### Defense Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 1: Edge                            │
│  - TLS 1.3 Termination                                      │
│  - DDoS Protection (Vercel/Cloudflare)                      │
│  - Rate Limiting (IP-based)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 2: Application                     │
│  - Input Validation (Zod schemas)                           │
│  - CSRF Protection                                          │
│  - XSS Prevention (React auto-escape)                       │
│  - Rate Limiting (User-based)                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 3: Authorization                   │
│  - Session Validation                                       │
│  - Role-Based Access Control (RBAC)                         │
│  - Tenant Isolation Check                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 4: Data                            │
│  - Parameterized Queries (Prisma)                           │
│  - Encryption at Rest (OAuth tokens)                        │
│  - Tenant-scoped Queries                                    │
│  - Audit Logging                                            │
└─────────────────────────────────────────────────────────────┘
```

### Tenant Isolation

```
┌─────────────────────────────────────────────────────────────┐
│                    Request Context                          │
│  ┌─────────────┐                                            │
│  │ Session     │──▶ Extract organizationId                  │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Query Wrapper                            │
│  prisma.load.findMany({                                     │
│    where: {                                                 │
│      organizationId: ctx.organizationId,  // ALWAYS         │
│      ...filters                                             │
│    }                                                        │
│  })                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14+ | React framework with App Router |
| Styling | Tailwind CSS | Mobile-first responsive design |
| Language | TypeScript | Type safety |
| Database | PostgreSQL | Primary data store |
| ORM | Prisma | Type-safe database access |
| Cache/Queue | Redis | Session cache + BullMQ jobs |
| Jobs | BullMQ | Background job processing |
| Auth | Custom + iron-session | Secure session management |
| Validation | Zod | Runtime type validation |
| Encryption | Node crypto | Token encryption |
| Password | Argon2 | Password hashing |
| AI | OpenAI/Anthropic | Load field extraction |
| Deploy | Vercel | Hosting + Edge functions |

## File Structure

```
loaddesk/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register, etc.)
│   │   ├── (dashboard)/        # Protected dashboard pages
│   │   ├── api/                # API routes
│   │   └── layout.tsx
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── loads/              # Load-specific components
│   │   ├── gps/                # GPS-specific components
│   │   └── layout/             # Layout components
│   ├── lib/                    # Core libraries
│   │   ├── auth/               # Authentication logic
│   │   ├── db/                 # Database utilities
│   │   ├── email/              # Email adapters
│   │   ├── ai/                 # AI extraction
│   │   ├── crypto/             # Encryption utilities
│   │   └── validation/         # Zod schemas
│   ├── services/               # Business logic services
│   ├── jobs/                   # BullMQ job definitions
│   └── types/                  # TypeScript types
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
├── docker/
│   └── docker-compose.yml      # Local dev setup
└── tests/                      # Test files
```
