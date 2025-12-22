# LoadDesk

Production-ready SaaS for logistics load intake and decisioning. Track inbound load requests from email, extract key information with AI, and manage accept/deny decisions with automated reply emails.

## Features

- **Email Integration**: Connect Gmail or Microsoft 365 mailboxes
- **AI-Powered Extraction**: Automatically extract load details using GPT-4 or Claude
- **Load Management**: Accept or deny loads with one tap
- **Automated Replies**: Send professional acceptance/denial emails automatically
- **GPS Tracking**: Track mileage for drivers (Personal or Fleet mode)
- **Mobile-First UI**: Optimized for phones and tablets
- **Multi-Tenant**: Secure organization isolation with role-based access

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Gmail/Microsoft 365 OAuth credentials (for email integration)
- OpenAI or Anthropic API key (for AI extraction)

### Local Development

1. **Clone and install**
```bash
cd loaddesk
npm install
```

2. **Start databases**
```bash
docker compose -f docker/docker-compose.yml up -d
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Setup database**
```bash
npm run db:push
npm run db:seed  # Optional: seed test data
```

5. **Run the app**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `SESSION_SECRET` | Yes | 32+ character secret for session encryption |
| `ENCRYPTION_KEY` | Yes | 64-character hex string for token encryption |
| `GOOGLE_CLIENT_ID` | For Gmail | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For Gmail | Google OAuth client secret |
| `AZURE_CLIENT_ID` | For O365 | Azure app client ID |
| `AZURE_CLIENT_SECRET` | For O365 | Azure app client secret |
| `OPENAI_API_KEY` | AI | OpenAI API key |
| `ANTHROPIC_API_KEY` | AI | Anthropic API key |
| `AI_PROVIDER` | No | `openai` or `anthropic` (default: openai) |

Generate secrets:
```bash
# Session secret
openssl rand -hex 32

# Encryption key
openssl rand -hex 32
```

## Architecture

```
loaddesk/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes
│   │   ├── (auth)/          # Auth pages
│   │   └── (dashboard)/     # Dashboard pages
│   ├── components/          # React components
│   ├── lib/                 # Core libraries
│   │   ├── auth/            # Authentication
│   │   ├── db/              # Database
│   │   ├── email/           # Email adapters
│   │   ├── ai/              # AI extraction
│   │   └── crypto/          # Encryption
│   └── services/            # Business logic
├── prisma/                  # Database schema
└── docker/                  # Local dev setup
```

## API Endpoints

See [API_ROUTES.md](./API_ROUTES.md) for full API documentation.

### Key Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/loads` - List loads
- `POST /api/loads/:id/decide` - Accept/deny load
- `POST /api/trips/start` - Start GPS trip
- `POST /api/trips/:id/end` - End GPS trip

## Security

This application is designed with SOC2 readiness in mind:

- **Authentication**: Argon2id password hashing, secure session cookies
- **Authorization**: Role-based access control (RBAC)
- **Tenant Isolation**: All queries scoped to organization
- **Encryption**: OAuth tokens encrypted at rest (AES-256-GCM)
- **Rate Limiting**: Protection against brute force attacks
- **Audit Logging**: All security-relevant actions logged
- **Input Validation**: Zod schemas for all inputs

See [SECURITY.md](./SECURITY.md) for full security documentation.

## Roles

| Role | Permissions |
|------|-------------|
| Owner | Full access |
| Dispatcher | Accept/deny loads |
| Viewer | Read-only access |
| Driver | GPS/trips only |

## GPS Tracking

GPS tracking requires explicit consent from each driver. Modes:

- **Personal**: Single driver, tracks own trips
- **Fleet**: Multiple drivers, managers can view all trips

Exports mileage logs as CSV for tax purposes (California-focused).

## Deployment

### Vercel

1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Manual

```bash
npm run build
npm start
```

## License

MIT
