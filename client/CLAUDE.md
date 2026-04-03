# KarigarNow — Frontend CLAUDE.md

## What This Is
React frontend for KarigarNow — Indian home labour 
booking platform. Tagline: "Apna kaam, apna worker"

## Tech Stack
- React (Vite) — JavaScript only, no TypeScript
- Tailwind CSS — for all styling
- Axios — for all API calls
- React Router v6 — for routing
- Backend: Spring Boot running on http://localhost:8080

## Folder Structure
client/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js         # Axios instance with base config
│   ├── components/
│   │   ├── common/          # Navbar, Footer, Loader, Toast
│   │   └── ui/              # Reusable buttons, cards, inputs
│   ├── pages/
│   │   ├── public/          # Home, Services, ServiceDetail, 
│   │   │                    # ThekedarProfile
│   │   ├── consumer/        # ConsumerDashboard, BookingHistory,
│   │   │                    # BookingDetail, NewBooking
│   │   └── thekedar/        # ThekedarDashboard, ManageJobs,
│   │                        # ManageWorkers, Earnings
│   ├── hooks/
│   │   └── useAuth.js       # Auth state hook
│   ├── context/
│   │   └── AuthContext.jsx  # Global auth state
│   ├── routes/
│   │   └── AppRoutes.jsx    # All route definitions
│   └── main.jsx
├── index.html               # Mockup reference in project root
├── CLAUDE.md                # This file
└── package.json

## Auth Flow
- Auth is cookie-based (httpOnly JWT set by backend)
- On app load → call GET /api/auth/me
  - Returns user info if cookie valid
  - Returns 401 if not logged in
- Based on role in response:
  - role: "consumer" → access consumer pages
  - role: "thekedar" → access thekedar dashboard
  - not logged in → access public pages only

## Route Structure
Public (no auth needed):
  /                    → Home page
  /services            → All service categories
  /services/:slug      → Thekedars offering that service
  /thekedars/:id       → Thekedar profile page
  /login               → Login page
  /register            → Register page

Consumer only (role = consumer):
  /dashboard           → Consumer dashboard
  /bookings            → My bookings list
  /bookings/:id        → Booking detail + OTP
  /book/:thekedarId    → New booking form

Thekedar only (role = thekedar):
  /thekedar/dashboard  → Thekedar dashboard
  /thekedar/jobs       → Incoming + active jobs
  /thekedar/workers    → Manage workers
  /thekedar/earnings   → Earnings summary

## Protected Route Rules
- If not logged in and hits /dashboard → redirect /login
- If consumer hits /thekedar/* → redirect /dashboard
- If thekedar hits /dashboard → redirect /thekedar/dashboard
- Role check done via AuthContext using /api/auth/me

## Axios Config (axios.js)
- baseURL: http://localhost:8080/api
- withCredentials: true (critical for cookies to work)
- On 401 response → redirect to /login automatically

## Design Reference
- Refer to index.html in project root for design mockup
- Colors: saffron #FF6B00 as primary accent
- Dark theme: background #0F0D0A
- Use Tailwind utility classes only
- Mobile responsive always

## API Endpoints Reference
Read API.md in project root for all available endpoints.

## Important Rules
- Always use Axios, never fetch()
- Always use withCredentials: true on Axios
- Never store JWT in localStorage — cookies handle it
- All protected pages check auth via useAuth() hook
- Show loading state while auth is being checked
- Handle API errors gracefully with toast messages