# MySociety — Society Management System

A full-stack, production-ready **Society / Apartment Management System** with role-based dashboards for **Admin, Security Staff, Residents, Accountant, Secretary and Chairman**.

Built with:
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication
- **Frontend:** React (Vite), Tailwind CSS, React Router, Recharts

## Features

- 🔐 JWT login with 10 roles (Admin, Security, Resident/Member, Accountant, Secretary, Chairman, Treasurer, Committee Member, Tenant, Housekeeping), each seeing only the modules relevant to it
- 🏠 Residents, Units/Flats, Visitors, Complaints, Maintenance management
- 📢 Notice Board, Amenities booking status, Documents
- 💰 Finance dashboard (collections, expenses, invoices, charts) + My Dues (resident/tenant self-service)
- 🗳️ Meetings, Voting/Polls, Emergency SOS, Camera Check Requests
- 📜 Society Policies, Investments & Assets, Required/Celebration Funds
- 🔑 Gate Passes (visitor/vendor/vehicle temporary access)
- 🕐 Staff Shifts & Attendance (Security + Housekeeping roster/handover)
- 🧹 Daily Tasks (housekeeping checklist) & Supplies/Consumables tracking
- 📄 Lease Management (tenant lease/rent/expiry tracking)
- 📊 Reports overview
- ⚙️ Settings (admin)
- Fully responsive — works on desktop and mobile browsers (so it behaves correctly inside a mobile WebView/app too)

## Project Structure

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
| Admin | admin@mysociety.com |
| Security | security@mysociety.com |
| Accountant | accountant@mysociety.com |
| Secretary | secretary@mysociety.com |
| Chairman | chairman@mysociety.com |
| Treasurer | treasurer@mysociety.com |
| Committee Member | committee@mysociety.com |
| Housekeeping | housekeeping@mysociety.com |
| Resident (Owner/Member) | rahul@mysociety.com |
| Tenant | tenant@mysociety.com |

The login page also has clickable buttons to auto-fill these.

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
