# CLAUDE.md — Truston Platform

This file provides guidance for AI assistants (Claude and others) working in this codebase.

---

## Project Overview

**Truston** is a B2B recruitment / headhunting management platform built as a single-page React application hosted on Google AI Studio (Cloud Run). It targets Korean enterprise companies and manages the full B2B outreach cycle: finding targets, sending cold outreach, issuing contracts, and processing customer inquiries.

The platform supports two user roles:
- **Public visitors** — view company info, pricing, and submit contact inquiries
- **Admins** — authenticated via Google OAuth (whitelist-based); manage companies, templates, contracts, and inquiries

---

## Technology Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 (functional components + hooks) |
| Language | TypeScript 5.8 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite` plugin) |
| Animation | `motion` (Framer Motion v12) |
| Icons | `lucide-react` |
| Backend / DB | Firebase 12 (Firestore + Google Auth) |
| AI | `@google/genai` SDK (configured, reserved for future use) |
| Export | `xlsx` for Excel generation |
| Class Utilities | `clsx` + `tailwind-merge` (exposed as `cn()`) |

---

## Repository Structure

```
/
├── src/
│   ├── main.tsx          # React DOM entry point — mounts <App /> with StrictMode
│   ├── App.tsx           # Entire application: state, routing, all views (1400+ lines)
│   ├── firebase.ts       # Firebase init + auth/db exports + isAdmin() helper
│   ├── constants.ts      # Static seed data: TARGET_COMPANIES, OUTREACH_TEMPLATES
│   ├── index.css         # Tailwind CSS directives only
│   └── lib/
│       └── utils.ts      # cn() utility (clsx + twMerge)
├── public/
│   ├── logo.jpg
│   └── logo_main.jpg
├── index.html                      # HTML shell — mounts #root
├── firebase-applet-config.json     # Firebase project credentials (client-safe)
├── firebase-blueprint.json         # Firestore schema reference
├── firestore.rules                 # Firestore security rules
├── vite.config.ts
├── tsconfig.json
├── package.json
├── metadata.json                   # AI Studio app metadata
└── .env.example                    # Environment variable template
```

---

## NPM Scripts

```bash
npm run dev      # Vite dev server — port 3000, 0.0.0.0 (all interfaces)
npm run build    # Production build → dist/
npm run preview  # Serve production build locally
npm run clean    # Remove dist/
npm run lint     # TypeScript type-check only (tsc --noEmit), no test runner
```

There is **no test framework** in this project. `npm run lint` is the only automated code check.

---

## Environment Variables

Copy `.env.example` to `.env.local` before running locally:

```
GEMINI_API_KEY="<your-gemini-api-key>"
APP_URL="<cloud-run-url>"
```

`GEMINI_API_KEY` is injected into the Vite build via `define` in `vite.config.ts`. The AI Studio runtime injects both variables automatically from the user secrets panel.

---

## Architecture & Data Flow

### Single-component Architecture

All UI lives in `src/App.tsx`. Sub-components are defined as **function declarations inside the same file** (e.g., `DashboardView`, `CompaniesView`, `OutreachView`, etc.). This is intentional for this project's scale — do not split into separate files unless the user explicitly requests it.

### Navigation / Routing

There is no router library. Navigation is driven by a `Tab` state variable:

```typescript
type Tab = 'dashboard' | 'companies' | 'outreach' | 'contract' | 'pricing' | 'about' | 'contact' | 'inquiries';
```

The active tab is set with `setActiveTab(tab)`. Public tabs: `about`, `pricing`, `contact`. Admin-only tabs: `dashboard`, `companies`, `outreach`, `contract`, `inquiries`.

### Authentication

- Google OAuth via `signInWithPopup` from Firebase Auth
- After sign-in, admin status is determined by `isAdmin()` in `src/firebase.ts`
- Admin whitelist: `wise2moon@gmail.com`, `wise2kwikwi@gmail.com`
- User state stored in React `useState`; auth listener set up with `onAuthStateChanged` in `useEffect`

### Firestore Data Layer

All Firestore interactions are via the Firebase SDK imported from `src/firebase.ts`. Real-time data uses `onSnapshot` listeners set up in `useEffect` hooks.

**Collections:**

| Collection | Access | Purpose |
|---|---|---|
| `targetCompanies` | Admin only | B2B prospect companies |
| `outreachTemplates` | Admin only | Email and call script templates |
| `contractTemplates` | Admin only | Recruitment contract templates |
| `inquiries` | Public write / Admin read+delete | Contact form submissions |

All documents use `Timestamp.now()` for `createdAt`.

### Firestore Security Rules

Defined in `firestore.rules`. Key rules:
- `targetCompanies`, `outreachTemplates`, `contractTemplates` — admin read/write only
- `inquiries` — anyone can `create`, only admins can `read`/`delete`, `update` is denied

**Never remove or loosen these rules without explicit request.**

---

## Localization

The app supports Korean (`ko`) and English (`en`). All user-facing strings are stored in a `translations` object at the top of `App.tsx`. The active language is stored in `lang: Lang` state. Strings are accessed as `t.someKey` where `t = translations[lang]`.

When adding new UI text, always add entries for **both** `ko` and `en` keys in `translations`.

---

## Code Conventions

### Naming

- **Components:** PascalCase — `CompaniesView`, `StatCard`, `PriceCard`
- **Functions/hooks:** camelCase — `handleSubmit`, `copyToClipboard`
- **Constants:** UPPER_SNAKE_CASE — `TARGET_COMPANIES`, `OUTREACH_TEMPLATES`
- **Types/Interfaces:** PascalCase — `Tab`, `Lang`, `Company`, `OutreachTemplate`

### Styling

- Use **Tailwind CSS utility classes exclusively**. No custom CSS beyond the `@tailwind` directives in `index.css`.
- Use `cn()` from `src/lib/utils.ts` for conditional class merging.
- Primary color palette: `emerald` (brand), `gray` (neutral), `blue`/`amber`/`red` (status indicators).
- Mobile-first responsive design using Tailwind breakpoints (`md:`, `lg:`).

### TypeScript

- Target ES2022, `moduleResolution: "bundler"`, JSX transform: `react-jsx`
- `strict` mode is **not** explicitly enabled; avoid introducing `any` types in new code
- Path alias `@/*` maps to the repo root

### State Management

- React `useState` for all local/UI state — no external state library
- Firebase `onSnapshot` for real-time server state
- No Context API, Redux, Zustand, or similar

### Imports

- Firebase utilities are **only imported from `src/firebase.ts`**, never directly from the `firebase` package
- Constants and types are imported from `src/constants.ts`

---

## Key Sub-components (defined in App.tsx)

| Component | Purpose |
|---|---|
| `NavItem` | Sidebar navigation button |
| `DashboardView` | Admin stats overview |
| `StatCard` | Individual metric card |
| `CompaniesView` | Target companies CRUD table with search, filter, Excel export |
| `OutreachView` | Email/call template CRUD |
| `ContractView` | Contract template CRUD with print and copy actions |
| `AboutView` | Public landing section with company features |
| `PricingView` | Pricing tiers carousel |
| `PriceCard` | Single pricing tier card |
| `ContactView` | Public inquiry submission form |
| `InquiriesView` | Admin view of submitted inquiries |
| `Footer` | Sticky footer with legal info |

---

## External Integrations

- **Google OAuth** — Firebase Auth with `GoogleAuthProvider`
- **Firestore** — real-time NoSQL database (named instance, ID from `firebase-applet-config.json`)
- **Gmail** — bulk email via `mailto:` links (opens Gmail web UI, not API)
- **Excel export** — `xlsx` library writes `.xlsx` file from company data via `XLSX.utils.json_to_sheet`
- **Google Generative AI** (`@google/genai`) — dependency present, not yet invoked in UI code; `GEMINI_API_KEY` is available via `process.env.GEMINI_API_KEY`

---

## Development Workflow

1. **Install dependencies:** `npm install`
2. **Set up environment:** copy `.env.example` → `.env.local`, fill in `GEMINI_API_KEY`
3. **Start dev server:** `npm run dev` (http://localhost:3000)
4. **Lint check:** `npm run lint`
5. **Production build:** `npm run build`

HMR is disabled when `DISABLE_HMR=true` (set by AI Studio runtime).

---

## Admin Access

To access admin features in a development environment, log in with one of the whitelisted Google accounts:
- `wise2moon@gmail.com`
- `wise2kwikwi@gmail.com`

Other Google accounts will authenticate successfully but see only public views.

---

## What NOT to Do

- Do **not** split `App.tsx` into separate component files unless the user explicitly requests refactoring
- Do **not** add a router library (react-router, etc.) without user request
- Do **not** import Firebase SDK functions directly — always go through `src/firebase.ts`
- Do **not** add a testing framework or CI configuration without explicit request
- Do **not** modify `firestore.rules` to loosen access controls without explicit request
- Do **not** commit `.env.local` or any file containing real API keys
- Do **not** add new translation keys to only one language — always update both `ko` and `en`
