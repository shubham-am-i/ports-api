# `__dirname` in ES Modules

In ECMAScript Modules (ESM), Node.js does not inject the CommonJS-specific global variables `__dirname` and `__filename` into the module scope. This is an intentional design choice to ensure that ES modules remain environment-agnostic and standards-compliant, as variables like `__dirname` are filesystem-specific and do not exist in browser environments.

## Modern Native Solution (Node.js v20.11+)

Starting with Node.js v20.11.0, you no longer need the boilerplate workaround. You can access these values directly through `import.meta`:

```js
const __dirname = import.meta.dirname;
const __filename = import.meta.filename;
```

## Traditional Workaround (Node.js < v20.11)

If you are on an older version, you must reconstruct the paths using `import.meta.url`, which provides the file's location as a `file://` URL:

```js
import { fileURLToPath } from "url";
import { dirname } from "path";

// 1. Convert file URL to a local filesystem path
const __filename = fileURLToPath(import.meta.url);

// 2. Extract the directory name from that path
const __dirname = dirname(__filename);
```

---

# Choosing a Database for This API

## Recommended: PostgreSQL

For a ports REST API with simple CRUD and filtering, PostgreSQL is the most practical choice.

### Why PostgreSQL?

**1. Data is relational and structured**
Every port has fixed, well-defined fields (`unlocode`, `name`, `country`, `port_role`, `status`). That is a perfect fit for a table with typed columns, not a schema-less document store.

**2. Filtering maps directly to SQL**
The `?country=india&status=active` queries are just `WHERE` clauses. SQL handles this natively and efficiently with indexes.

**3. `unlocode` is a natural unique key**
PostgreSQL enforces uniqueness at the database level, removing the need for the manual duplicate-check written in `createPort`.

**4. Industry standard for backend APIs**
It is what most companies use. Freshers learning PostgreSQL + Express are learning a stack they will actually encounter at work.

### Why Not the Others?

| DB | Why it's less ideal here |
|----|--------------------------|
| **MongoDB** | Good for flexible/nested documents. Ports data is flat and structured — you'd gain nothing and lose type safety |
| **MySQL** | Perfectly valid, but PostgreSQL has better JSON support, window functions, and is generally more feature-complete |
| **SQLite** | Great for local development and prototyping, but not production-ready (no concurrent writes) |
| **Redis** | In-memory key-value store — useful as a cache on top of Postgres, not as a primary DB |

### Migration Path

```
JSON file (now)  →  PostgreSQL (production)
```

