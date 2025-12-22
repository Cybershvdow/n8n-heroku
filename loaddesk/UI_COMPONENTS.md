# LoadDesk UI Component Map

## Design Principles

- **Mobile-First**: All components designed for 320px+ screens, enhanced for larger
- **Touch-Friendly**: Minimum 44px tap targets
- **Bottom Navigation**: Primary nav at bottom for thumb reach
- **Card-Based**: Content in scannable cards
- **High Contrast**: Clear visual hierarchy

---

## Component Hierarchy

```
App
├── AuthLayout
│   ├── LoginPage
│   ├── RegisterPage
│   ├── ForgotPasswordPage
│   └── ResetPasswordPage
│
├── OnboardingLayout
│   └── OnboardingFlow
│       ├── OrgSetupStep
│       └── EmailConnectStep
│
└── DashboardLayout
    ├── BottomNavigation
    ├── TopBar
    │   └── NotificationBell
    │
    ├── DashboardTab
    │   ├── LoadsFilter
    │   ├── LoadsList
    │   │   └── LoadCard (multiple)
    │   └── LoadDetailSheet
    │
    ├── EmailTab
    │   ├── EmailFilter
    │   ├── EmailList
    │   │   └── EmailCard (multiple)
    │   └── EmailDetailSheet
    │
    ├── CallsTab
    │   └── ComingSoonPlaceholder
    │
    ├── GPSTab
    │   ├── PersonalModeView
    │   │   ├── TripControls
    │   │   ├── TripsList
    │   │   └── TripCard (multiple)
    │   │
    │   └── FleetModeView
    │       ├── DriversList
    │       │   └── DriverCard (multiple)
    │       ├── DriverTripsSheet
    │       └── TripCard (multiple)
    │
    └── SettingsTab
        ├── ProfileSection
        ├── OrganizationSection
        ├── IntegrationsSection
        ├── RolesSection
        └── SecuritySection
```

---

## Page Components

### Auth Pages

#### LoginPage `/login`
```
┌─────────────────────────────┐
│          LOADDESK           │
│            Logo             │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │ Email                 │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Password          👁  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │       Sign In         │  │
│  └───────────────────────┘  │
│                             │
│      Forgot password?       │
│                             │
│  ─────────── or ──────────  │
│                             │
│  Don't have an account?     │
│         Register            │
│                             │
└─────────────────────────────┘
```

#### RegisterPage `/register`
```
┌─────────────────────────────┐
│          LOADDESK           │
│       Create Account        │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │ Full Name             │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Email                 │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Password          👁  │  │
│  └───────────────────────┘  │
│  • 12+ characters           │
│  • Not a common password    │
│                             │
│  ┌───────────────────────┐  │
│  │ Company Name          │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │    Create Account     │  │
│  └───────────────────────┘  │
│                             │
│   Already have an account?  │
│          Sign in            │
└─────────────────────────────┘
```

---

### Dashboard Layout

#### TopBar
```
┌─────────────────────────────┐
│  LOADDESK     🔔 (3)        │
└─────────────────────────────┘
```
- Notification bell with unread count badge
- Clicking opens NotificationCenter sheet

#### BottomNavigation
```
┌───────┬───────┬───────┬───────┬───────┐
│  📊   │  📧   │  📞   │  📍   │  ⚙️   │
│ Dash  │ Email │ Calls │  GPS  │ Set.  │
└───────┴───────┴───────┴───────┴───────┘
```
- Fixed at bottom
- Active tab highlighted
- Icons + labels

---

### Dashboard Tab

#### LoadsFilter
```
┌─────────────────────────────┐
│ Status: [All ▼]             │
│                             │
│ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ All │ │Pend.│ │ Acc │    │
│ └─────┘ └─────┘ └─────┘    │
└─────────────────────────────┘
```

#### LoadCard
```
┌─────────────────────────────┐
│ 📧 ABC Logistics            │
│ ───────────────────         │
│ 📍 Los Angeles, CA          │
│    ↓                        │
│ 📍 Phoenix, AZ              │
│                             │
│ 📅 Jan 15, 8:00 AM          │
│ 💰 $2,500                   │
│ 📦 Electronics              │
│                             │
│ ┌─────────────────────────┐ │
│ │ AI Summary:             │ │
│ │ • 500 mile haul         │ │
│ │ • Same-day delivery     │ │
│ │ • Electronic freight    │ │
│ └─────────────────────────┘ │
│                             │
│ Confidence: ████████░░ 85%  │
│ ⚠ Missing: weight           │
│                             │
│ ┌──────────┐ ┌──────────┐  │
│ │  ACCEPT  │ │  DENY    │  │
│ │   ✓      │ │    ✗     │  │
│ └──────────┘ └──────────┘  │
│                             │
│ Received: 10 min ago        │
└─────────────────────────────┘
```

#### LoadDetailSheet (Bottom Sheet)
```
┌─────────────────────────────┐
│ ─────  (drag handle)        │
├─────────────────────────────┤
│ Load Details                │
│                             │
│ FROM                        │
│ ABC Logistics               │
│ broker@abc.com              │
│ (555) 123-4567              │
│                             │
│ PICKUP                      │
│ 123 Main St                 │
│ Los Angeles, CA 90001       │
│ Jan 15, 2024 8:00 AM        │
│                             │
│ DROPOFF                     │
│ 456 Oak Ave                 │
│ Phoenix, AZ 85001           │
│ Jan 15, 2024 4:00 PM        │
│                             │
│ DETAILS                     │
│ Rate: $2,500.00             │
│ Commodity: Electronics      │
│ Weight: Not specified       │
│ Ref #: REF-123456           │
│                             │
│ AI ANALYSIS                 │
│ ┌─────────────────────────┐ │
│ │ • 500 mile haul from    │ │
│ │   LA to Phoenix         │ │
│ │ • Electronics shipment  │ │
│ │ • Same-day required     │ │
│ └─────────────────────────┘ │
│                             │
│ ORIGINAL EMAIL              │
│ [View Email ↗]              │
│                             │
│ ┌──────────┐ ┌──────────┐  │
│ │  ACCEPT  │ │  DENY    │  │
│ └──────────┘ └──────────┘  │
└─────────────────────────────┘
```

---

### Email Tab

#### EmailList
```
┌─────────────────────────────┐
│ 📧 Emails                   │
│                             │
│ Filter: [Load Requests ▼]   │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ ● ABC Logistics         │ │
│ │   Load Available: LA... │ │
│ │   10:30 AM    → Load    │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │   XYZ Freight           │ │
│ │   Re: Quote Request     │ │
│ │   9:15 AM    Not Load   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

### Calls Tab (MVP Placeholder)

```
┌─────────────────────────────┐
│ 📞 Calls                    │
├─────────────────────────────┤
│                             │
│                             │
│         📞                  │
│    Coming Soon!             │
│                             │
│  Call integration will be   │
│  available via n8n webhook. │
│                             │
│  ┌───────────────────────┐  │
│  │  View n8n Setup Guide │  │
│  └───────────────────────┘  │
│                             │
│                             │
└─────────────────────────────┘
```

---

### GPS Tab

#### Personal Mode
```
┌─────────────────────────────┐
│ 📍 GPS Tracking             │
│ Mode: Personal              │
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │    ┌───────────────┐    │ │
│ │    │  START TRIP   │    │ │
│ │    │      ▶        │    │ │
│ │    └───────────────┘    │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ Recent Trips                │
│ ┌─────────────────────────┐ │
│ │ Jan 14 • LA → Phoenix   │ │
│ │ 372.5 mi • 6h 30m       │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Jan 13 • Local          │ │
│ │ 45.2 mi • 1h 15m        │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │   Export Mileage CSV    │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

#### Active Trip View
```
┌─────────────────────────────┐
│ 📍 Trip in Progress         │
├─────────────────────────────┤
│                             │
│    ⏱ 02:34:15              │
│    Started 2:30 PM          │
│                             │
│    📍 Current: Tracking...  │
│    🛣 Distance: 127.3 mi    │
│                             │
│ ┌─────────────────────────┐ │
│ │      END TRIP           │ │
│ │         ⏹               │ │
│ └─────────────────────────┘ │
│                             │
│ Purpose: Delivery           │
│ Notes: Load #12345          │
│                             │
└─────────────────────────────┘
```

#### Fleet Mode - Drivers List
```
┌─────────────────────────────┐
│ 📍 Fleet GPS                │
│ Mode: Fleet (5 drivers)     │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 👤 John Doe             │ │
│ │ ● Active Trip           │ │
│ │ 127.3 mi today          │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 👤 Jane Smith           │ │
│ │ ○ No active trip        │ │
│ │ 0 mi today              │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │  Export All Mileage     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

### Settings Tab

```
┌─────────────────────────────┐
│ ⚙️ Settings                 │
├─────────────────────────────┤
│                             │
│ PROFILE                     │
│ ┌─────────────────────────┐ │
│ │ 👤 John Doe             │ │
│ │    john@company.com     │ │
│ │    Edit Profile →       │ │
│ └─────────────────────────┘ │
│                             │
│ ORGANIZATION                │
│ ┌─────────────────────────┐ │
│ │ My Trucking Co          │ │
│ │ Mode: Personal          │ │
│ │ [Switch to Fleet]       │ │
│ └─────────────────────────┘ │
│                             │
│ EMAIL INTEGRATIONS          │
│ ┌─────────────────────────┐ │
│ │ ✓ Gmail Connected       │ │
│ │   dispatch@company.com  │ │
│ │   [Disconnect]          │ │
│ ├─────────────────────────┤ │
│ │ + Connect Microsoft 365 │ │
│ └─────────────────────────┘ │
│                             │
│ TEAM (Owner only)           │
│ ┌─────────────────────────┐ │
│ │ Manage Team Members →   │ │
│ └─────────────────────────┘ │
│                             │
│ SECURITY                    │
│ ┌─────────────────────────┐ │
│ │ Change Password →       │ │
│ │ Active Sessions →       │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │       Sign Out          │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

### Notification Center (Bottom Sheet)

```
┌─────────────────────────────┐
│ ───── (drag handle)         │
├─────────────────────────────┤
│ 🔔 Notifications            │
│                [Mark All ✓] │
├─────────────────────────────┤
│ ● New Load Request          │
│   From ABC Logistics        │
│   2 min ago                 │
├─────────────────────────────┤
│ ● Reply Failed              │
│   Could not send to...      │
│   15 min ago                │
├─────────────────────────────┤
│ ○ Email Connected           │
│   Gmail sync active         │
│   1 hour ago                │
└─────────────────────────────┘
```

---

## Shared Components

### UI Primitives

| Component | Description |
|-----------|-------------|
| `Button` | Primary, secondary, danger variants |
| `Input` | Text input with label, error state |
| `Select` | Dropdown select |
| `Card` | Content container with shadow |
| `Badge` | Status indicators |
| `Avatar` | User/driver avatars |
| `Sheet` | Bottom sheet modal |
| `Dialog` | Confirmation dialogs |
| `Toast` | Temporary notifications |
| `Skeleton` | Loading placeholders |
| `EmptyState` | No content placeholders |

### Layout Components

| Component | Description |
|-----------|-------------|
| `AuthLayout` | Centered card layout for auth pages |
| `DashboardLayout` | Main app shell with nav |
| `BottomNav` | Fixed bottom navigation |
| `TopBar` | Header with notifications |
| `TabContent` | Scrollable tab content area |

### Feature Components

| Component | Description |
|-----------|-------------|
| `LoadCard` | Load summary with actions |
| `LoadDetailSheet` | Full load details |
| `DecisionButtons` | Accept/Deny button pair |
| `ConfidenceBar` | Visual confidence indicator |
| `EmailCard` | Email list item |
| `TripCard` | Trip summary |
| `TripControls` | Start/End trip buttons |
| `DriverCard` | Driver list item |
| `NotificationItem` | Single notification |
| `IntegrationCard` | Email provider connection |

---

## Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px+ | Large phones |
| `md` | 768px+ | Tablets |
| `lg` | 1024px+ | Desktop |

### Tablet Enhancements (768px+)
- Side-by-side list + detail view
- Larger tap targets
- More info visible on cards

### Desktop Enhancements (1024px+)
- Sidebar navigation instead of bottom nav
- Multi-column layouts
- Hover states

---

## Color Scheme

```css
/* Primary */
--primary: #2563eb;      /* Blue 600 */
--primary-dark: #1d4ed8; /* Blue 700 */

/* Status */
--success: #16a34a;      /* Green 600 */
--warning: #ca8a04;      /* Yellow 600 */
--danger: #dc2626;       /* Red 600 */

/* Neutral */
--bg: #ffffff;
--bg-secondary: #f9fafb;
--text: #111827;
--text-secondary: #6b7280;
--border: #e5e7eb;

/* Load Status */
--pending: #eab308;      /* Yellow */
--accepted: #22c55e;     /* Green */
--denied: #ef4444;       /* Red */
```
