# Mozeh Monorepo

This repository contains the **frontend (Next.js)** and **backend (Express + Prisma)** apps.

## Quickstart

```bash
# 1) Install deps (from repo root)
npm install

# 2) Setup environment
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 3) Prepare the database
cd apps/backend
npx prisma generate
npx prisma db push
# optional: npx prisma db seed

# 4) Run Dev (from repo root)
npm run dev
```

## Structure

```
mozeh/
  apps/
    backend/           # Express API + Prisma ORM
      src/
        app.js         # Express app (routes/middleware)
        server.js      # Bootstraps server
        routes/        # Express routers (auth, products, orders)
        controllers/   # (reserved) business logic handlers
        services/      # (reserved) domain services
        middlewares/   # (reserved) auth/error handling
        utils/         # helpers (e.g., jwt)
        lib/prisma.js  # Prisma client
      prisma/
        schema.prisma
        seed.js (optional)
      .env.example
      package.json
    frontend/          # Next.js app (Pages Router for now)
      src/
        pages/
        components/
        styles/
      public/
      .env.example
      package.json
  package.json         # npm workspaces
```

## Security & Ops

- Per‑app `.env` files, **never** commit secrets.
- CORS restricted via `CORS_ORIGIN` list (comma‑separated).
- Prisma schema located in `apps/backend/prisma/schema.prisma`.
- Separate `app.js` and `server.js` to simplify testing and serverless support.
