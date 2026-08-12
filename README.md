# MySociety — Society Management System

A full-stack, production-ready **Society / Apartment Management System** with role-based dashboards for **Admin, Security Staff, Residents, Accountant, Secretary and Chairman**.

Built with:
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication
- **Frontend:** React (Vite), Tailwind CSS, React Router, Recharts

## ⚠️ Important: Re-seeding after this update

This update changes the `Membership` collection's structure (a user can now hold multiple roles/flats in the same society). **Your existing MongoDB database still has the OLD unique index cached**, which will cause errors when you reseed. Before running `npm run seed` again, drop the old data first - easiest ways:

- **Simplest:** in `backend/.env`, change the database name at the end of your `MONGO_URI` (e.g. `.../mysociety` → `.../mysociety2`) - this starts fresh with zero migration hassle.
- **Or:** in MongoDB Atlas, open your cluster → Browse Collections → delete the `memberships` collection (or the whole database) before reseeding.

## What's new in this update

- **Progressive login flow**: Login now only asks for email + password up front. If needed, it then asks you to pick your **Society**, then your **Role** (a person can now hold more than one role in the same society - e.g. Owner *and* Secretary), then your **Flat** (if that role owns/rents more than one flat). Try logging in as `rahul@mysociety.com` / `123456` to see all three steps.
- **No more separate Admin account.** Whoever sets up a society (via Plans & Offers) becomes its **Chairman**. Chairman can view everything Secretary can view, but generally cannot edit anything - **except** the new Society Structure screen.
- **Society Structure (Chairman-only editing)**: add/remove buildings, and within each building add/remove floors with their own flat count (floors don't have to match each other). For "Individual Houses" societies (set at signup), Chairman can add/remove standalone houses instead.

## Features

- 🌐 **Public marketing website**: Home, Contact Us, Plans & Offers (with a 3-step "create your society" flow that auto-provisions flats based on buildings/flats count you enter)
- 🔐 **Multi-tenant auth**: Login / Register / Forgot Password, all as tabs on one page. The same email can belong to multiple societies - login resolves this automatically and shows a "choose your society" screen when needed.
- 🧪 **Guest sandbox**: "Try as Guest" instantly spins up a temporary, fully isolated society pre-loaded with sample data. Auto-deletes after 3 days (background cleanup job).
- 🏢 **True multi-tenancy**: every module (residents, complaints, finance, etc.) is scoped to the logged-in user's current society - data from one society is never visible to another.
- 🔐 JWT login with 10 roles (Admin, Security, Resident/Member, Accountant, Secretary, Chairman, Treasurer, Committee Member, Tenant, Housekeeping), each seeing only the modules relevant to it
- 🏠 Residents, Units/Flats (supports one owner having multiple flats), Visitors, Complaints, Maintenance management
- 🐾 Pets registry
- 📢 Notice Board, Amenities booking status, Documents
- 💰 Finance dashboard (collections, expenses, invoices, charts) + My Dues (resident/tenant self-service, aggregated across all of their flats)
- 🗳️ Meetings, Voting/Polls, Emergency SOS, Camera Check Requests
- 📜 Society Policies, Investments & Assets, Required/Celebration Funds
- 🔑 Gate Passes (visitor/vendor/vehicle temporary access)
- 🕐 Staff Shifts & Attendance (Security + Housekeeping roster/handover)
- 🧹 Daily Tasks (housekeeping checklist) & Supplies/Consumables tracking
- 📄 Lease Management (tenant lease/rent/expiry tracking)
- 👨‍👩‍👧 **Personal/Family/Vehicle/Home Service Data** - flat-private records (visible only to that flat's own members, Secretary and Chairman)
- 🗳️ **Elections**: secret-ballot voting for Committee Members and Upper Management roles - one vote per flat, only aggregate results ever shown
- 📋 **Meeting Attendance**: self check-in ("Add Me") that auto-captures the attendee's role from their logged-in account
- ✅ **Agenda Items & Role Checklist**: per-meeting decisions with status/priority/estimated timelines, plus a reference checklist of responsibilities per role
- 📊 Reports overview
- ⚙️ Settings (admin)
- Fully responsive — works on desktop and mobile browsers (so it behaves correctly inside a mobile WebView/app too)

## Multi-Tenancy: how it works

- Every operational record (Complaint, Invoice, Notice, etc.) has a `society` field. Every API request is scoped to `req.societyId`, which comes from the JWT — so one society's data is never visible or writable from another society's session.
- **User accounts are global** (one email = one account across the whole platform). **Society membership** (role, flat, etc.) lives in a separate `Membership` collection, so the same email can belong to several societies with a different role in each.
- Login flow: email + password only. If the account has one society, you're logged straight in. If it has several, you'll see a "choose your society" screen.
- New societies are created via the **Plans & Offers** page: pick a plan → enter buildings/flats → name your society → confirm your admin account. Units (flats) are auto-generated based on what you entered.
- **Guest sandbox**: clicking "Try as Guest" creates a brand-new, fully isolated Society with sample data and logs you in immediately as its admin — no signup required. It's automatically deleted 3 days later by a background job (`utils/cleanupGuestSandboxes.js`, runs hourly from `server.js`).

## Public Routes vs the App

- `/` , `/contact`, `/plans`, `/login` — public marketing site, no login required
- `/app`, `/app/residents`, `/app/finance`, etc. — the actual application, requires login



```
MySociety/
├── backend/            # Express + MongoDB REST API
│   ├── config/         # DB connection
│   ├── controllers/    # Auth, dashboard, generic CRUD controller
│   ├── middleware/     # JWT auth, role guard, error handler
│   ├── models/         # Mongoose schemas (18 models)
│   ├── routes/         # REST endpoints per module
│   ├── utils/          # helpers + seed script (demo data)
│   └── server.js
└── frontend/            # React (Vite) app
    └── src/
        ├── api/          # axios instance
        ├── components/   # Sidebar, Topbar, Layout, ModuleListPage, FormModal...
        ├── config/       # role -> nav item access map
        ├── context/      # AuthContext
        └── pages/        # one page per module
```

---

## 1. Run it locally / in GitHub Codespaces

You need **Node.js 18+** and a **MongoDB connection string**. The easiest option inside Codespaces is a free **MongoDB Atlas** cluster (no install needed):

1. Go to https://www.mongodb.com/cloud/atlas/register → create a free (M0) cluster.
2. Create a database user + password, and allow access from anywhere (`0.0.0.0/0`) under Network Access (fine for dev).
3. Copy the connection string — looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/mysociety?retryWrites=true&w=majority`

> Alternative: run MongoDB locally inside Codespaces instead of Atlas — see the **"Local Mongo instead of Atlas"** section at the bottom.

### Exact commands to paste in the Codespaces terminal

Once your Codespace is open (repo name `MySociety`), run:

```bash
# ---- Backend setup ----
cd backend
cp .env.example .env
```

Now open `backend/.env` in the editor and paste your MongoDB connection string into `MONGO_URI`, e.g.:

```
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/mysociety?retryWrites=true&w=majority
```

Then continue in the terminal:

```bash
npm install
npm run seed        # creates demo data + demo login accounts
npm run dev          # starts API on port 5000
```

Keep that terminal running, **open a second terminal** (Codespaces lets you split terminals) and run the frontend:

```bash
# ---- Frontend setup (in a NEW terminal) ----
cd frontend
cp .env.example .env
npm install
npm run dev          # starts React app on port 5173
```

Codespaces will show a popup "Open in Browser" for port `5173` — click it (or go to the **Ports** tab and open port 5173). That's your live app.

### Demo login accounts (password for all: `123456`)

| Role | Email |
|---|---|
| Security | security@mysociety.com |
| Accountant | accountant@mysociety.com |
| Secretary | secretary@mysociety.com |
| Chairman (view-only + Society Structure rights) | chairman@mysociety.com |
| Treasurer | treasurer@mysociety.com |
| Committee Member | committee@mysociety.com |
| Housekeeping | housekeeping@mysociety.com |
| **Owner of 2 flats (A-101, D-402) AND Secretary** in the same society | rahul@mysociety.com |
| Tenant | tenant@mysociety.com |

The login page also has clickable buttons to auto-fill these. Log in as `rahul@mysociety.com` to see the full Society → Role → Flat selection flow in action.

---

## 2. Pushing this to your GitHub repo (`MySociety`)

If you're starting from an **empty** GitHub repo named `MySociety`:

```bash
git init
git add .
git commit -m "Initial commit - MySociety full stack app"
git branch -M main
git remote add origin https://github.com/<your-username>/MySociety.git
git push -u origin main
```

Then open that repo in **GitHub Codespaces** (Code → Codespaces → Create codespace on main) and follow the commands in section 1 above.

---

## 3. Local Mongo instead of Atlas (optional)

If you'd rather not use Atlas, you can run MongoDB inside the Codespace container:

```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo mkdir -p /data/db
sudo mongod --fork --logpath /var/log/mongod.log --dbpath /data/db
```

Then in `backend/.env` keep the default:
```
MONGO_URI=mongodb://127.0.0.1:27017/mysociety
```

(If `apt-get install mongodb` isn't available on your image, stick with the Atlas option above — it's simpler and more reliable in Codespaces.)

---

## 4. API Overview

Base URL: `http://localhost:5000/api`

| Endpoint              | Description                          |
|------------------------|--------------------------------------|
| `POST /auth/register`  | Create user                          |
| `POST /auth/login`     | Login, returns JWT                   |
| `GET  /auth/me`        | Current logged-in user               |
| `GET  /dashboard/overview` | Aggregate stats for dashboard    |
| `GET/POST/PUT/DELETE /residents` | Residents CRUD              |
| `GET/POST/PUT/DELETE /units` | Units/Flats CRUD                |
| `GET/POST/PUT/DELETE /visitors` | Visitors CRUD                |
| `GET/POST/PUT/DELETE /complaints` | Complaints CRUD             |
| `GET/POST/PUT/DELETE /maintenance` | Maintenance requests CRUD  |
| `GET/POST/PUT/DELETE /notices` | Notice board CRUD              |
| `GET/POST/PUT/DELETE /amenities` | Amenities CRUD                |
| `GET/POST/PUT/DELETE /documents` | Documents CRUD                |
| `GET/POST/PUT/DELETE /invoices` | Invoices CRUD                  |
| `GET/POST/PUT/DELETE /transactions` | Income/expense CRUD        |
| `GET/POST/PUT/DELETE /meetings` | Meetings CRUD                  |
| `GET/POST/PUT/DELETE /polls` | Voting/Polls CRUD                 |
| `GET/POST/PUT/DELETE /emergencies` | SOS alerts CRUD              |
| `GET/POST/PUT/DELETE /camera-requests` | Camera check requests CRUD |
| `GET/POST/PUT/DELETE /policies` | Society policies CRUD          |
| `GET/POST/PUT/DELETE /investments` | Investments/Assets CRUD     |
| `GET/POST/PUT/DELETE /funds` | Required/Celebration funds CRUD   |

All routes (except `/auth/register` and `/auth/login`) require header:
`Authorization: Bearer <token>`

Every list endpoint supports query params: `?search=&status=&category=&page=1&limit=20` plus other model-specific filters (e.g. `tower`, `type`, `priority`).

---

## 5. Role-based access

Each role only sees the sidebar modules relevant to it (configured in `frontend/src/config/navConfig.js`) and the backend independently enforces the same rules in `backend/routes/*.js` via the `authorize(...)` middleware — so access control isn't just hidden on the frontend, it's actually blocked on the API too.

## 6. Next steps / things you may want to extend

- Wire up real file uploads for Documents (currently metadata only) — e.g. using `multer` + S3/Cloudinary.
- Add push notifications (e.g. via Firebase Cloud Messaging) for the mobile app wrapper.
- Wrap the frontend in Capacitor/React Native WebView if you want a native mobile app shell — since the UI is fully responsive it will work as-is inside a WebView.
- Add payment gateway integration (Razorpay/Stripe) for invoice payments.
- Deploy backend (Render/Railway/EC2) + frontend (Vercel/Netlify) for production, and switch `VITE_API_URL` / `CLIENT_URL` to the deployed URLs.
