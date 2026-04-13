# Build the Ports REST API from Scratch

> A step-by-step workshop. Complete each step and test before moving on.

---

## Step 1 — What We're Building

A REST API for managing seaports. Here is the full API contract:

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/ports` | List all ports (with filters + pagination) |
| GET | `/ports/:code` | Get one port by its UNLOCODE |
| POST | `/ports` | Add a new port |
| DELETE | `/ports/:code` | Remove a port |

Each port has these fields:

```json
{
  "unlocode": "SGSIN",
  "name": "SINGAPORE",
  "country": "SINGAPORE",
  "port_role": "DESTINATION",
  "status": "active"
}
```

By the end of this session, your API will handle all of the above.

---

## Step 2 — Prerequisites Check

Open your terminal and verify:

```bash
node -v     # should print a version number e.g. v20.x.x
npm -v      # should print a version number
```


> **Search:** "how to check if node js is installed"

---

## Step 3 — Scaffold the Project

Run in your terminal:

```bash
mkdir ports-api
cd ports-api
npm init -y
```

Open the folder in VS Code. Look at the generated `package.json`.

Now add this line inside `package.json` at the top level:

```json
"type": "module"
```

Your `package.json` should look like this:

```json
{
  "name": "ports-api",
  "version": "1.0.0",
  "type": "module",
  ...
}
```

> **Search:** "what is type module in package.json"
>
> **Why:** This lets you use `import`/`export` syntax instead of the older `require()`.

---

## Step 4 — Install Express

```bash
npm install express
```

After this, a `node_modules/` folder appears. Create a `.gitignore` file in the root:

```
node_modules/
```

> **Search:** "what is express js used for"

---

## Step 5 — Add Run Scripts

In `package.json`, find the `"scripts"` section and replace it with:

```json
"scripts": {
  "start": "node app.js",
  "dev": "node --watch app.js"
}
```

> **Question:** What does `--watch` do? Search: "node --watch flag"

---

## Step 6 — Create the Folder Structure

Create these four folders inside `ports-api/`:

```
data/
routes/
controllers/
utils/
```

Your project should now look like:

```
ports-api/
├── data/
├── routes/
├── controllers/
├── utils/
├── package.json
└── .gitignore
```

> **Why:** This is called separation of concerns — each folder has exactly one job. You will feel the benefit as the project grows.

---

## Step 7 — Add the Data File

Create `data/ports.json` and paste this into it:

```json
[
  { "unlocode": "IRBND", "country": "IRAN", "name": "BANDAR ABBAS", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "AEJEA", "country": "UNITED ARAB EMIRATES", "name": "JEBEL ALI", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "AEKLF", "country": "UNITED ARAB EMIRATES", "name": "KHOR AL FAKKAN", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "AEDXB", "country": "UNITED ARAB EMIRATES", "name": "DUBAI", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "AEAUH", "country": "UNITED ARAB EMIRATES", "name": "ABU DHABI", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "QAHMD", "country": "QATAR", "name": "PORT OF HAMAD", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "SGSIN", "country": "SINGAPORE", "name": "SINGAPORE", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "CNSHA", "country": "CHINA", "name": "SHANGHAI", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "CNSHK", "country": "CHINA", "name": "SHEKOU", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "CNYTN", "country": "CHINA", "name": "YANTIAN", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "CNTSN", "country": "CHINA", "name": "TIANJIN", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "CNNGB", "country": "CHINA", "name": "NINGBO", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "CNTAO", "country": "CHINA", "name": "QINGDAO", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "HKHKG", "country": "HONG KONG", "name": "HONG KONG", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "USNYC", "country": "UNITED STATES", "name": "NEW YORK", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "USLAX", "country": "UNITED STATES", "name": "LOS ANGELES", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "USOAK", "country": "UNITED STATES", "name": "OAKLAND", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "USSEA", "country": "UNITED STATES", "name": "SEATTLE", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "USHOU", "country": "UNITED STATES", "name": "HOUSTON", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "USORF", "country": "UNITED STATES", "name": "NORFOLK", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "USSAV", "country": "UNITED STATES", "name": "SAVANNAH", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "USCHS", "country": "UNITED STATES", "name": "CHARLESTON", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "USMIA", "country": "UNITED STATES", "name": "MIAMI", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "NLRTM", "country": "NETHERLANDS", "name": "ROTTERDAM", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "DEHAM", "country": "GERMANY", "name": "HAMBURG", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "BEANR", "country": "BELGIUM", "name": "ANTWERP", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "GBFXT", "country": "UNITED KINGDOM", "name": "FELIXSTOWE", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "GBLGP", "country": "UNITED KINGDOM", "name": "LONDON GATEWAY", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "GBTIL", "country": "UNITED KINGDOM", "name": "TILBURY", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "GBSOU", "country": "UNITED KINGDOM", "name": "SOUTHAMPTON", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "FRLEH", "country": "FRANCE", "name": "LE HAVRE", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "ITMIL", "country": "ITALY", "name": "MILAN", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "ITGOA", "country": "ITALY", "name": "GENOA", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "ESLPA", "country": "SPAIN", "name": "LAS PALMAS", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "ESVLC", "country": "SPAIN", "name": "VALENCIA", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "ESBCN", "country": "SPAIN", "name": "BARCELONA", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "INNSA", "country": "INDIA", "name": "NHAVA SHEVA", "port_role": "ORIGIN", "status": "active" },
  { "unlocode": "INMAA", "country": "INDIA", "name": "CHENNAI", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "INVTZ", "country": "INDIA", "name": "VISAKHAPATNAM", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "INCOK", "country": "INDIA", "name": "KOCHI", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "INCCU", "country": "INDIA", "name": "KOLKATA", "port_role": "ORIGIN", "status": "active" },
  { "unlocode": "INHZA", "country": "INDIA", "name": "HAZIRA", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "INJNP", "country": "INDIA", "name": "JAWAHARLAL NEHRU", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "PKKAR", "country": "PAKISTAN", "name": "KARACHI", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "LKCMB", "country": "SRI LANKA", "name": "COLOMBO", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "BDCGP", "country": "BANGLADESH", "name": "CHITTAGONG", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "THBKK", "country": "THAILAND", "name": "BANGKOK", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "THLCH", "country": "THAILAND", "name": "LAEM CHABANG", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "VNSGN", "country": "VIETNAM", "name": "HO CHI MINH CITY", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "VNHPH", "country": "VIETNAM", "name": "HAIPHONG", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "MYPEN", "country": "MALAYSIA", "name": "PENANG", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "MYPKG", "country": "MALAYSIA", "name": "PORT KLANG", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "MYPGU", "country": "MALAYSIA", "name": "PASIR GUDANG", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "IDTPP", "country": "INDONESIA", "name": "TANJUNG PRIOK", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "IDJKT", "country": "INDONESIA", "name": "JAKARTA", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "IDBTM", "country": "INDONESIA", "name": "BATAM", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "IDSUB", "country": "INDONESIA", "name": "SURABAYA", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "PHMNL", "country": "PHILIPPINES", "name": "MANILA", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "JPYOK", "country": "JAPAN", "name": "YOKOHAMA", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "JPTYO", "country": "JAPAN", "name": "TOKYO", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "JPNGO", "country": "JAPAN", "name": "NAGOYA", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "JPOSA", "country": "JAPAN", "name": "OSAKA", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "KRPUS", "country": "KOREA, REPUBLIC OF", "name": "BUSAN", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "KRINC", "country": "KOREA, REPUBLIC OF", "name": "INCHEON", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "AUMEL", "country": "AUSTRALIA", "name": "MELBOURNE", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "AUSYD", "country": "AUSTRALIA", "name": "SYDNEY", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "AUBNE", "country": "AUSTRALIA", "name": "BRISBANE", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "AUPKG", "country": "AUSTRALIA", "name": "PORT KEMLA", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "NZAKL", "country": "NEW ZEALAND", "name": "AUCKLAND", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "SAJED", "country": "SAUDI ARABIA", "name": "JEDDAH", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "SADMM", "country": "SAUDI ARABIA", "name": "DAMMAM", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "OMSLJ", "country": "OMAN", "name": "SALALAH", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "OMSOH", "country": "OMAN", "name": "SOHAR", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "JOAQJ", "country": "JORDAN", "name": "AQABA", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "EGALY", "country": "EGYPT", "name": "ALEXANDRIA", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "EGSOK", "country": "EGYPT", "name": "PORT OF SOKHNA", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "EGPSD", "country": "EGYPT", "name": "PORT SAID", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "EGDAM", "country": "EGYPT", "name": "PORT OF DAMIETTA", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "ZADUR", "country": "SOUTH AFRICA", "name": "DURBAN", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "ZACPT", "country": "SOUTH AFRICA", "name": "CAPE TOWN", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "MXZLO", "country": "MEXICO", "name": "MANZANILLO", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "MXVER", "country": "MEXICO", "name": "VERACRUZ", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "BRSSZ", "country": "BRAZIL", "name": "SANTOS", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "BRRIO", "country": "BRAZIL", "name": "RIO DE JANEIRO", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "CLSAI", "country": "CHILE", "name": "SAN ANTONIO", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "CLVAP", "country": "CHILE", "name": "VALPARAISO", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "CACVR", "country": "CANADA", "name": "VANCOUVER", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "CATOR", "country": "CANADA", "name": "TORONTO", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "CAMTR", "country": "CANADA", "name": "MONTREAL", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "TRIST", "country": "TURKEY", "name": "ISTANBUL", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "TRMER", "country": "TURKEY", "name": "MERSIN", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "GRPIR", "country": "GREECE", "name": "PIRAEUS", "port_role": "DESTINATION", "status": "active" },
  { "unlocode": "RUKLD", "country": "RUSSIA", "name": "KALININGRAD", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "RUVVO", "country": "RUSSIA", "name": "VLADIVOSTOK", "port_role": "DESTINATION", "status": "passive" },
  { "unlocode": "RUULU", "country": "RUSSIA", "name": "ULYANOVSK", "port_role": "DESTINATION", "status": "passive" }
]
```

> **Note:** We are using a JSON file for data. The server loads it once at startup.

---

## Step 8 — Create `app.js` — The Entry Point

Create `app.js` in the root. Using what you know, try to:

1. Import express
2. Create an `app` with `express()`
3. Define `PORT` as `3000`
4. Call `app.listen(PORT, callback)` that logs a message

```js
import express from "express";

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Ports API running on http://localhost:${PORT}`);
});
```

Run `npm run dev` — does it start without errors?

> **Search:** "express js hello world example"

---

## Step 9 — Add a Health Check Route

Before `app.listen`, add:

```js
app.get("/", (_req, res) => {
  res.json({ message: "Ports API running" });
});
```

Open your browser and go to `http://localhost:3000` — do you see the JSON?

> **Concept:** `req` = the incoming request from the client. `res` = your response back to the client.
>
> **Question:** What does the underscore in `_req` mean? Why would you write it that way?

---

## Step 10 — Add Middleware

Middleware runs before your routes on every request. Add these two blocks above your routes:

**1. Parse JSON bodies** — lets you read `req.body` in POST requests:

```js
app.use(express.json());
```

**2. Request logger** — write this yourself:

```js
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
```

> **Search:** "express middleware order"
>
> **Question:** Why do we call `next()`? What happens if we don't?

---

## Step 11 — Create the Router

Create `routes/ports.routes.js`. Declare 4 routes and export the router. For now, use placeholder handlers that just return `res.json({ message: "TODO" })`:

```js
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => res.json({ message: "TODO" }));
router.get("/:code", (req, res) => res.json({ message: "TODO" }));
router.post("/", (req, res) => res.json({ message: "TODO" }));
router.delete("/:code", (req, res) => res.json({ message: "TODO" }));

export default router;
```

> **Search:** "express Router() example"

---

## Step 12 — Mount the Router in `app.js`

Import and mount the router in `app.js`:

```js
import portsRouter from "./routes/ports.routes.js";

// ... after middleware, before app.listen
app.use("/ports", portsRouter);
```

Test: `GET http://localhost:3000/ports` — you should see `{ "message": "TODO" }`.

> **Think about it:** The router's `"/"` combined with the mount point `"/ports"` gives you `/ports`. The `"/:code"` becomes `/ports/:code`. The router doesn't know about `/ports` — it only knows about paths relative to where it's mounted.

---

## Step 13 — Create the Controller — Setup

Create `controllers/ports.controller.js`. First, load the JSON data once at startup.

**Why doesn't `__dirname` just work here?**

In CommonJS (the old `require()` style), Node.js automatically gave you `__dirname` and `__filename` as globals. In ES Modules (`"type": "module"`), it does not — because ES modules are designed to also run in browsers, where filesystem paths don't exist. So you have to get the path yourself.

**Modern solution — Node.js v20.11 and above:**

```js
import { readFileSync } from "fs";
import { join } from "path";

const dataPath = join(import.meta.dirname, "../data/ports.json");

let ports = JSON.parse(readFileSync(dataPath, "utf-8"));
```

**Traditional workaround — Node.js below v20.11:**

```js
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// 1. Convert the file:// URL to a real filesystem path
const __filename = fileURLToPath(import.meta.url);

// 2. Extract the directory name from that path
const __dirname = dirname(__filename);

const dataPath = join(__dirname, "../data/ports.json");

let ports = JSON.parse(readFileSync(dataPath, "utf-8"));
```

Run `node -v` to check which version you have. Use the modern solution if you are on v20.11+, otherwise use the workaround.

> **Search:** "import.meta.dirname node js" or "why __dirname not available in ES modules node"
>
> **Question:** Why `let` and not `const`? *(Hint: we will modify the array in POST and DELETE.)*

---

## Step 14 — Add Response Helpers

Add two small helper functions in the controller, above your exports:

```js
const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

const fail = (res, message, status) =>
  res.status(status).json({ success: false, error: message });
```

> **Why:** Every response in this API follows the same shape — `success + data` or `success + error`. These two helpers mean you never repeat that structure.

---

## Step 15 — `getAllPorts` — Basic Version

Export and implement `getAllPorts`. For now, just return everything:

```js
export const getAllPorts = (req, res) => {
  ok(res, { ports });
};
```

Update the router to use this function instead of the placeholder:

```js
import { getAllPorts } from "../controllers/ports.controller.js";

router.get("/", getAllPorts);
```

Test with Postman / Thunder Client / curl:
```
GET http://localhost:3000/ports
```

---

## Step 16 — `getAllPorts` — Add Filtering

Read query params from `req.query` and filter the results. Add support one at a time:

- `?country=india` — partial, case-insensitive match on `p.country`
- `?status=active` — exact match (`active` or `passive`)
- `?port_role=ORIGIN` — exact match (`DESTINATION` or `ORIGIN`)

```js
export const getAllPorts = (req, res) => {
  const { country, status, port_role } = req.query;

  let result = [...ports];

  if (country) {
    result = result.filter((p) =>
      p.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  if (status) {
    result = result.filter(
      (p) => p.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (port_role) {
    result = result.filter(
      (p) => p.port_role.toLowerCase() === port_role.toLowerCase()
    );
  }

  ok(res, { ports: result });
};
```

> **Test:** Does `?country=united` return both UAE and UK ports? It should — because "UNITED ARAB EMIRATES" and "UNITED KINGDOM" both contain the word "united".

---

## Step 17 — `getAllPorts` — Add Pagination

After the filtering, slice the result into pages. Also return a `pagination` metadata object:

```js
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const total = result.length;
  const totalPages = Math.ceil(total / limitNum);
  const start = (pageNum - 1) * limitNum;
  const paginated = result.slice(start, start + limitNum);

  ok(res, {
    ports: paginated,
    pagination: { total, page: pageNum, limit: limitNum, totalPages },
  });
```

> **Search:** "how to paginate an array in javascript"
>
> **Question:** Why do we cap `limit` at `100`? What could go wrong if we didn't?

---

## Step 18 — `getPortByCode`

Add `GET /ports/:code` — find a single port by its unlocode:

```js
export const getPortByCode = (req, res) => {
  const { code } = req.params;

  const port = ports.find(
    (p) => p.unlocode.toLowerCase() === code.toLowerCase()
  );

  if (!port) {
    return fail(res, `Port with unlocode "${code}" not found`, 404);
  }

  ok(res, port);
};
```

Wire it up in the router, then test:

```
GET http://localhost:3000/ports/SGSIN   → Singapore
GET http://localhost:3000/ports/sgsin   → should also work (case-insensitive)
GET http://localhost:3000/ports/XXXXX   → 404
```

---

## Step 19 — `createPort`

Add `POST /ports` — three things to handle in order:

1. Pull `unlocode`, `name`, `country` from `req.body` — validate all three are present, return `400` with the list of missing fields if any are absent
2. Check for a duplicate unlocode — return `400` if one already exists
3. Push the new port into the `ports` array, return it with status `201`

```js
export const createPort = (req, res) => {
  const { unlocode, name, country } = req.body;

  const missing = [];
  if (!unlocode) missing.push("unlocode");
  if (!name) missing.push("name");
  if (!country) missing.push("country");

  if (missing.length > 0) {
    return fail(res, `Missing required field(s): ${missing.join(", ")}`, 400);
  }

  const exists = ports.some(
    (p) => p.unlocode.toLowerCase() === unlocode.toLowerCase()
  );
  if (exists) {
    return fail(res, `A port with unlocode "${unlocode}" already exists`, 400);
  }

  const newPort = { ...req.body, unlocode: unlocode.toUpperCase() };
  ports.push(newPort);

  ok(res, newPort, 201);
};
```

> **Common mistake:** If `req.body` is `undefined`, it means `express.json()` middleware is missing or placed after the routes. Check Step 10.

Test:
```
POST http://localhost:3000/ports
Body: { "unlocode": "TEST1", "name": "Test Port", "country": "TESTLAND" }
```

---

## Step 20 — `deletePort`

Add `DELETE /ports/:code` — remove a port by unlocode:

```js
export const deletePort = (req, res) => {
  const { code } = req.params;

  const index = ports.findIndex(
    (p) => p.unlocode.toLowerCase() === code.toLowerCase()
  );

  if (index === -1) {
    return fail(res, `Port with unlocode "${code}" not found`, 404);
  }

  const [removed] = ports.splice(index, 1);

  ok(res, { message: `Port "${removed.unlocode}" deleted successfully` });
};
```

> **Note:** `splice(index, 1)` returns an array of removed items. Destructuring `const [removed] = ...` grabs the first (and only) item from that array.

Test: delete a port, then try to GET it — you should get a 404.

---

## Step 21 — Add a 404 Catch-All

At the bottom of `app.js`, after all routes but **before** `app.listen`, add:

```js
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});
```

> **Question:** Why must this go last? What happens if you put it first?

---

## Step 22 — Final Check: Test All Endpoints

Work through every case in this table before calling it done:

| Test | What to send | Expected response |
|------|-------------|-------------------|
| List all ports | `GET /ports` | Array of 10 ports + pagination object |
| Filter by country | `GET /ports?country=india` | Only Indian ports |
| Filter + limit | `GET /ports?status=active&limit=5` | 5 active ports |
| Get one port | `GET /ports/SGSIN` | Singapore port object |
| Get non-existent | `GET /ports/INVALID` | `404` with error message |
| Create — missing fields | `POST /ports` with empty body | `400` listing missing fields |
| Create — valid | `POST /ports` with unlocode + name + country | New port, status `201` |
| Create — duplicate | `POST /ports` with same unlocode again | `400` duplicate error |
| Delete | `DELETE /ports/TEST1` | Success message |
| Delete — already gone | `DELETE /ports/TEST1` again | `404` |
| Unknown route | `GET /anything-else` | `404` "Route not found" |

---

Create a collection in postman. Create a environment in it

## Step 23 — What You Built

Your final folder structure:

```
ports-api/
├── app.js
├── package.json
├── .gitignore
├── data/
│   └── ports.json
├── routes/
│   └── ports.routes.js
├── controllers/
│   └── ports.controller.js
└── utils/
    └── apiError.js
```

Concepts touched in this workshop:

| Concept | Where you used it |
|---------|-------------------|
| Express setup + middleware | `app.js` |
| Routing with `Router()` | `routes/ports.routes.js` |
| Controller functions | `controllers/ports.controller.js` |
| `req.params` | `GET /ports/:code`, `DELETE /ports/:code` |
| `req.query` | `GET /ports?country=&status=&page=` |
| `req.body` | `POST /ports` |
| HTTP status codes | 200, 201, 400, 404 |
| In-memory data (array) | `ports` array in controller |
| ES Modules | `import` / `export` throughout |
