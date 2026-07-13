# Richlux Properties

Real-estate lead-gen and listings app for Richlux Property (house sales, property management, shortlet, rentals, land sales), built on Next.js (App Router), MongoDB/Mongoose, NextAuth, and Cloudinary.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create a `.env.local` in the project root with:

```bash
# MongoDB
MONGODB_URI=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_ID=
GOOGLE_CLIENT_SECRET=

# Credentials-provider password hashing
SALT=10

# Cloudinary (media storage/optimization for listing images & video)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

## First-time setup: creating a Super Admin

There is no self-service way to become an admin. After registering a normal account (via `/register` or Google sign-in):

1. Run the role backfill once against your database (safe to run anytime, only touches accounts missing a `role`):
   ```bash
   node -r dotenv/config scripts/backfillUserRoles.js dotenv_config_path=.env.local
   ```
2. Promote your account to Super Admin:
   ```bash
   node -r dotenv/config scripts/promoteSuperAdmin.js dotenv_config_path=.env.local you@example.com
   ```

From there, the Super Admin can manage other users' roles from `/admin/users`.

## Roles

- **Super Admin** — full access, including user/role management (`/admin/users`).
- **Manager** — manages all listings and leads (`/admin/listings`, `/admin/leads`).
- **Agent** — manages only their own listings (`/admin/listings`).

## Project structure

- `app/` — routes (App Router). Public site, auth, and `/admin/*` (role-gated).
- `components/` — shared UI (`components/ui/`), admin-only (`components/admin/`), and page sections.
- `model/` — Mongoose schemas (`User`, `UserRequest`, `Listing`).
- `constants/listing.js` — Listing category/status enums shared by client and server code.
- `utils/` — `database.js` (Mongo connection), `authOptions.js` (NextAuth config), `auth.js` (RBAC helpers), `cloudinary.js` (server-side Cloudinary SDK config).
- `proxy.js` — Next.js 16's route-middleware convention; gates `/admin/*` by role.
