# How Prisma Works — Step by Step

---

## 1. You write a schema, not a database

Everything starts in [prisma/schema.prisma](prisma/schema.prisma). You describe your data in Prisma's own language:

```prisma
model Port {
  id       Int    @id @default(autoincrement())
  unlocode String @unique
  name     String
  ...
}
```

This is just a description — nothing exists in the database yet.

---

## 2. Prisma translates it into real SQL

When you run `npx prisma migrate dev --name init`, Prisma reads your schema and generates a `.sql` file:

```sql
-- prisma/migrations/20260413_init/migration.sql
CREATE TABLE "Port" (
  "id" SERIAL PRIMARY KEY,
  "unlocode" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  ...
);
```

Then it runs that SQL against your PostgreSQL database. Your table now physically exists.

---

## 3. Prisma generates a client tailored to your schema

After the migration, Prisma generates JavaScript code inside `node_modules/@prisma/client`. This generated client knows about your exact models — it's not generic.

So `prisma.port.findMany()` exists because you have a `Port` model. If you had a `Ship` model, `prisma.ship.findMany()` would exist too.

---

## 4. Your app imports and uses that client

```js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// This becomes: SELECT * FROM "Port" WHERE country ILIKE '%india%' LIMIT 10
prisma.port.findMany({
  where: { country: { contains: "india", mode: "insensitive" } },
  take: 10
})
```

You write JavaScript. Prisma builds the SQL query. PostgreSQL executes it. Prisma returns plain JS objects back to you.

---

## 5. The full picture

```
schema.prisma
     │
     ▼
npx prisma migrate dev        →   SQL runs on PostgreSQL (table created)
     │
     ▼
npx prisma generate           →   Client generated in node_modules/
     │
     ▼
Your code (controller.js)     →   prisma.port.findMany() → SQL → results
```

Every time you change the schema (add a column, rename a field), you run migrate again — Prisma figures out the difference and generates only the SQL needed to update the existing table.

---

## GUI to See Records — Prisma Studio

Prisma ships with its own GUI called **Prisma Studio**. No installation needed:

```bash
npx prisma studio
```

Open `http://localhost:5555` in your browser.

You can:
- Browse all tables and rows
- Filter and sort records
- Edit values inline
- Add and delete rows
- See the effect of your API calls in real time

> This is the best way to verify your POST and DELETE endpoints actually changed the database — make a request in Postman, then refresh Studio and confirm the row appeared or disappeared.

---

## Other GUI Options

| Tool | Type | Good for |
|------|------|----------|
| **Prisma Studio** | Built-in, runs in browser | Quick inspection, no setup |
| **pgAdmin 4** | Desktop/web app | Full PostgreSQL management, query editor |
| **TablePlus** | Desktop app (Mac/Windows/Linux) | Clean UI, supports many DBs |
| **DBeaver** | Desktop app, free | Most powerful, good for complex queries |

For learning, **Prisma Studio is enough**. If you want to write raw SQL and explore the database deeply, install **pgAdmin** — it's the official PostgreSQL GUI and free.
