# Adding PostgreSQL + Prisma to the Ports API

> This guide picks up where `WORKSHOP.md` left off. Right now the API uses an in-memory array — data resets on every restart. By the end of this guide it will read and write from a real PostgreSQL database and data will survive restarts.

---

## Before You Start — What is an ORM?

An **ORM (Object-Relational Mapper)** lets you talk to a database using your programming language instead of raw SQL.

Without ORM:
```sql
SELECT * FROM ports WHERE country ILIKE '%india%';
```

With Prisma:
```js
prisma.port.findMany({ where: { country: { contains: "india", mode: "insensitive" } } })
```

Prisma also handles migrations and gives you a visual database browser — all from one tool.

---

## Step 1 — Install PostgreSQL

> Skip this if PostgreSQL is already installed. Check with `psql --version`.

**On Fedora / RHEL:**
```bash
sudo dnf install postgresql postgresql-server
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**On Ubuntu / Debian:**
```bash
sudo apt install postgresql
sudo systemctl start postgresql
```

**On macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

Verify it is running:
```bash
pg_isready
# output: /tmp:5432 - accepting connections
```

---

## Step 2 — Create the Database

Open the PostgreSQL shell:
```bash
sudo -u postgres psql
```

Inside the shell, run:
```sql
CREATE DATABASE ports_db;
\q
```

> **What just happened:** You created an empty database named `ports_db`. All port data will live here.

---

## Step 3 — Install Prisma

Inside your project folder, run:
```bash
npm install @prisma/client
npm install --save-dev prisma
```

Then initialise Prisma:
```bash
npx prisma init
```

This creates two things:

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Where you define your data models and DB connection |
| `.env` | Where you store your secret `DATABASE_URL` |

Make sure `.env` is in your `.gitignore` — it should already be there. Never commit this file.

---

## Step 4 — Configure the Connection URL

Open `.env`. Replace its contents with your actual connection details:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ports_db"
```

This URL has the format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

> **Special characters in passwords:** If your password contains `@`, `#`, `/`, or other special characters, you must URL-encode them. For example `admin@123` becomes `admin%40123`:
> ```
> DATABASE_URL="postgresql://postgres:admin%40123@localhost:5432/ports_db"
> ```

---

## Step 5 — Write the Schema

Open `prisma/schema.prisma`. It currently only has the `generator` and `datasource` blocks. Add the `Port` model at the bottom:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Port {
  id        Int      @id @default(autoincrement())
  unlocode  String   @unique
  name      String
  country   String
  port_role String
  status    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**What each part means:**

| Field | Type | Note |
|-------|------|------|
| `id` | Int | Auto-incrementing primary key |
| `unlocode` | String | `@unique` — no two ports can share one |
| `name`, `country`, `port_role`, `status` | String | Plain text columns |
| `createdAt`, `updatedAt` | DateTime | Automatically managed by Prisma |

> **Note:** The schema is just a description at this point. No table exists in the database yet.

---

## Step 6 — Run the Migration

A **migration** translates your schema into real SQL and runs it against the database:

```bash
npx prisma migrate dev --name init
```

What happens behind the scenes:
1. Prisma generates a `.sql` file inside `prisma/migrations/`
2. Runs it against `ports_db` — your `Port` table now exists
3. Generates the Prisma client into `node_modules/@prisma/client`

Open `prisma/migrations/.../migration.sql` and read it — you will see the exact `CREATE TABLE` statement Prisma wrote for you.

> **Search:** "what is a database migration" if this concept is new.

---

## Step 7 — Create the Seed Script

Create `prisma/seed.js`. This script will read `data/ports.json` and insert all ports into the database:

```js
import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ports = JSON.parse(
  readFileSync(join(__dirname, "../data/ports.json"), "utf-8")
);

async function main() {
  console.log("Seeding database...");
  await prisma.port.deleteMany();
  const result = await prisma.port.createMany({ data: ports });
  console.log(`Seeded ${result.count} ports.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

Then register the seed script in `package.json`:
```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

Now run it:
```bash
npx prisma db seed
```

You should see:
```
Seeding database...
Seeded 96 ports.
```

> **Why `deleteMany()` first?** So re-running the seed is safe — it always resets back to the original 96 ports instead of creating duplicates.

---

## Step 8 — Inspect with Prisma Studio

Before touching the controller, verify your data is actually in the database:

```bash
npx prisma studio
```

Open `http://localhost:5555` — you will see the `Port` table with all 96 rows. You can browse, filter, edit, and delete records visually.

Keep this open as you test the API — every POST and DELETE should be visible here in real time.

---

## Step 9 — Rewrite the Controller

Open `controllers/ports.controller.js`. You need to replace the in-memory logic with Prisma calls.

**Remove** the file-reading setup at the top:
```js
// DELETE all of this
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "../data/ports.json");
let ports = JSON.parse(readFileSync(dataPath, "utf-8"));
```

**Replace it with:**
```js
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
```

Then rewrite each handler:

**`getAllPorts`** — use `findMany` with a `where` filter and `skip`/`take` for pagination:
```js
export const getAllPorts = async (req, res) => {
  const { country, status, port_role, page, limit } = req.query;

  const where = {};
  if (country)    where.country   = { contains: country,   mode: "insensitive" };
  if (status)     where.status    = { equals:   status,    mode: "insensitive" };
  if (port_role)  where.port_role = { equals:   port_role, mode: "insensitive" };

  const pageNum  = Math.max(1, parseInt(page)  || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip     = (pageNum - 1) * limitNum;

  const [total, ports] = await Promise.all([
    prisma.port.count({ where }),
    prisma.port.findMany({ where, skip, take: limitNum }),
  ]);

  ok(res, {
    ports,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
};
```

**`getPortByCode`** — use `findUnique`:
```js
export const getPortByCode = async (req, res) => {
  const { code } = req.params;
  const port = await prisma.port.findUnique({
    where: { unlocode: code.toUpperCase() },
  });
  if (!port) return fail(res, `Port with unlocode "${code}" not found`, 404);
  ok(res, port);
};
```

**`createPort`** — use `create`, catch `P2002` for duplicates:
```js
export const createPort = async (req, res) => {
  const { unlocode, name, country, port_role, status = "active" } = req.body;

  const missing = [];
  if (!unlocode)  missing.push("unlocode");
  if (!name)      missing.push("name");
  if (!country)   missing.push("country");
  if (!port_role) missing.push("port_role");
  if (missing.length > 0)
    return fail(res, `Missing required field(s): ${missing.join(", ")}`, 400);

  try {
    const newPort = await prisma.port.create({
      data: { unlocode: unlocode.toUpperCase(), name, country, port_role, status },
    });
    ok(res, newPort, 201);
  } catch (e) {
    if (e.code === "P2002")
      return fail(res, `A port with unlocode "${unlocode}" already exists`, 400);
    throw e;
  }
};
```

**`deletePort`** — use `delete`, catch `P2025` for not found:
```js
export const deletePort = async (req, res) => {
  const { code } = req.params;
  try {
    const removed = await prisma.port.delete({
      where: { unlocode: code.toUpperCase() },
    });
    ok(res, { message: `Port "${removed.unlocode}" deleted successfully` });
  } catch (e) {
    if (e.code === "P2025")
      return fail(res, `Port with unlocode "${code}" not found`, 404);
    throw e;
  }
};
```

---

## Step 10 — Prisma Error Codes

Instead of checking manually (like `if (index === -1)`), Prisma throws typed errors. Two you will use here:

| Code | When it fires | What to return |
|------|--------------|----------------|
| `P2002` | Tried to insert a duplicate `unlocode` | `400` |
| `P2025` | `delete` or `findUnique` on a row that doesn't exist | `404` |

> **Important:** Always `throw e` at the end of your catch block for codes you don't recognise. Swallowing unknown errors makes bugs invisible.

---

## Step 11 — Start the Server and Test

```bash
npm run dev
```

Work through this checklist. After each POST or DELETE, check Prisma Studio to confirm the change happened in the database:

| Test | Expected |
|------|----------|
| `GET /ports` | 96 ports from DB with pagination |
| `GET /ports?country=india` | Only Indian ports |
| `GET /ports/SGSIN` | Singapore |
| `GET /ports/INVALID` | `404` |
| `POST /ports` (missing `port_role`) | `400` listing missing fields |
| `POST /ports` (valid body) | New row, `201` — visible in Prisma Studio |
| `POST /ports` (same unlocode again) | `400` duplicate error |
| `DELETE /ports/TEST1` | Row removed — gone from Prisma Studio |
| `DELETE /ports/TEST1` again | `404` |
| Restart server → `GET /ports` | Data is still there |

The last test is the key one — **data now survives a restart**.

---

## Step 12 — After Cloning (for anyone who clones this repo)

Because `.env` is in `.gitignore`, a fresh clone needs these steps before running:

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file with your DATABASE_URL
echo 'DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ports_db"' > .env

# 3. Create the database (first time only)
sudo -u postgres psql -c "CREATE DATABASE ports_db;"

# 4. Run migrations to create tables
npx prisma migrate deploy

# 5. Generate the Prisma client
npx prisma generate

# 6. Seed the database
npx prisma db seed
```

---

## Summary — What Prisma Replaced

| What you wrote manually before | What Prisma does now |
|-------------------------------|----------------------|
| Load JSON file, store in array | `PrismaClient` talks to PostgreSQL |
| `.filter()` loops in JS | `where` clause — PostgreSQL filters it |
| Manual duplicate check | `P2002` error from the DB |
| Manual `findIndex` for not-found | `P2025` error from the DB |
| Count + slice for pagination | `prisma.port.count` + `skip`/`take` |
| Data lost on restart | Data lives in the database |
