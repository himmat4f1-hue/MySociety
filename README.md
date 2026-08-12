# MySociety — Society Management System (PostgreSQL edition)

Full-stack Society/Apartment Management System, migrated from MongoDB/Mongoose to **PostgreSQL + Sequelize**.

- **Backend:** Node.js, Express, Sequelize, PostgreSQL, JWT auth
- **Frontend:** React (Vite), Tailwind CSS, React Router

## Setup

### 1. Database
Create a PostgreSQL database (locally, or on Render/Supabase/etc):
```bash
createdb mysociety_db
```

### 2. Backend
```bash
cd backend
cp .env.example.postgresql .env   # then fill in DB_HOST / DB_USER / DB_PASSWORD / JWT_SECRET
npm install
npm run seed     # creates tables, seeds the demo "Greenfield Residency" society
npm run dev
```
`npm run seed` connects, syncs all tables (no manual migrations needed), and inserts a full demo dataset — one login per role, password `123456` for all:

| Role | Email |
|---|---|
| Security | security@mysociety.com |
| Accountant | accountant@mysociety.com |
| Secretary | secretary@mysociety.com |
| Chairman | chairman@mysociety.com |
| Treasurer | treasurer@mysociety.com |
| Committee Member | committee@mysociety.com |
| Housekeeping | housekeeping@mysociety.com |
| Resident (owner of A-101 & D-402, also Secretary) | rahul@mysociety.com |
| Tenant | tenant@mysociety.com |

### 3. Frontend
```bash
cd frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm install
npm run dev
```

## What changed in this migration

- Every model (`backend/models/*.js`) is now a real `sequelize.define()` model on Postgres — no leftover Mongoose schemas.
- Field names were kept identical to the original Mongo build (`society`, `raisedBy`, `owner`, `flatId`, etc.) so none of the 37 route files or the React frontend needed to change.
- `genericController.js` and `flatPrivateController.js` — the two factories almost every route is built on — were rewritten for Sequelize (`findAndCountAll`, `Op.iLike` search, manual "populate" for the handful of fields that used to use Mongoose's `.populate()`).
- Every model's `toJSON()` returns both `id` and `_id` (same UUID) so the existing frontend, which reads `_id` everywhere, keeps working unmodified.
- `utils/seed.js`, `demoData.js`, `provisionUnits.js`, `cleanupGuestSandboxes.js` all rewritten for Sequelize.
- Added `GET /api/dashboard/secretary` — a richer, breakdown-by-type/priority endpoint powering the new Secretary Dashboard screen.
- Verified end-to-end against a real local Postgres instance: seed → login → dashboard → CRUD create → populated reads all tested and working before packaging this zip.

## Notes

- `sequelize.sync({ alter: true })` runs automatically in development (see `config/db.js`) — it creates/updates tables on boot, so no separate migration step is required to get started. For a production deployment you may want to switch to real `sequelize-cli` migrations instead of `sync`.
- Postgres arrays (`voters`, `attendees`) and JSONB (`Resident.vehicles`, `Amenity.bookings`, etc.) are used where the original schema had embedded arrays/subdocuments.
