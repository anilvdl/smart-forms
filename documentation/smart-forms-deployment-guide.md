# Smart Forms Monorepo Deployment & Build Guide

This document consolidates all the steps, configurations, and troubleshooting tips needed to split, develop, build, and deploy the **static-site**, **dynamic-app**, and **shared** packages of the Smart Forms monorepo both locally and on Namecheap’s Node.js (LiteSpeed/LSAPI) hosting environment.

---

## 1. Monorepo Structure

```
/smart-forms
  package.json            ← with `"workspaces": ["packages/*"]`
  packages/
    shared/               ← common React components, utils, CSS, icons
    static-site/          ← Next.js “export” app (landing pages)
    dynamic-app/          ← Next.js “server” app (auth, SSR, API)
```

---

## 2. Environment Files

| File                                | Usage              | Loaded on           |
|-------------------------------------|--------------------|---------------------|
| `.env.local`                        | Local dev secrets  | `next dev`          |
| `.env.development.local`            | Dev overrides      | `next dev`          |
| `.env.production`                   | Production values  | `next build`        |
| `.env.production.local`             | Prod overrides     | `next build`        |

- Public vars must start with `NEXT_PUBLIC_…`.

---

## 3. Static-site Build & Export

1. **Config** `packages/static-site/next.config.js`:

   ```js
   module.exports = {
     output: "export",
     trailingSlash: true,
     reactStrictMode: true,
   };
   ```

2. **Build locally**:

   ```bash
   cd packages/static-site
   npm install
   npm run build    # generates out/
   ```

3. **Deploy**: Upload only `out/` folder contents to your static host.

---

## 4. Shared Package Entrypoint

Create `packages/shared/index.ts`:

```ts
export { default as NavBar } from "./components/ui/Navbar";
// … other exports …
```

In `packages/shared/package.json`:

```json
{
  "name": "@smartforms/shared",
  "version": "1.0.0",
  "main": "index.ts",
  "types": "index.ts"
}
```

---

## 5. Dynamic-app Custom Server

`packages/dynamic-app/server.js`:

```js
const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const host = "0.0.0.0";
const LS_SOCKET = process.env.LSNODE_SOCKET;
const PORT = process.env.PORT || 3001;

const app = next({ dev, hostname: host, port: PORT, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  if (LS_SOCKET) {
    server.listen(LS_SOCKET, () =>
      console.log(`Listening on LSAPI socket ${LS_SOCKET}`)
    );
  } else {
    server.listen(PORT, host, () =>
      console.log(`Dev at http://${host}:${PORT}`)
    );
  }
});
```

In `packages/dynamic-app/package.json`:

```json
"scripts": {
  "dev": "next dev -p 3001",
  "build": "next build",
  "start": "npm run build && node server.js"
}
```

---

## 6. Transpile Shared Code

`packages/dynamic-app/next.config.js`:

```js
const path = require("path");
const withTM = require("next-transpile-modules")([
  path.resolve(__dirname, "../shared")
]);

module.exports = withTM({
  reactStrictMode: true,
  experimental: { externalDir: true },
  webpack(config) {
    config.resolve.alias["@smartforms/shared"] = path.resolve(__dirname, "../shared");
    return config;
  },
});
```
Run below command in hosting servers terminal
```
npx prisma generate --schema=packages/dynamic-app/prisma/schema.prisma
```
---

## 7. Deployment on Namecheap

1. **Upload** entire monorepo to `~/auth-sfapp-test/`.
2. In cPanel **Setup Node.js App**:
   - **App root**: `/home/you/auth-sfapp-test`
   - **Startup file**: `packages/dynamic-app/server.js`
   - Click **Run NPM Install**, then **Restart**.

NPM workspaces will symlink `@smartforms/shared` under `node_modules/`.

---

## 8. Shared Navigation Logic

Use in both apps:

```ts
import { navigationUtil } from "@smartforms/shared";

const { navigate } = navigationUtil();
navigate("/login");   // goes to auth subdomain
```

Environment variables:
- `NEXT_PUBLIC_SFORMS_STATIC_BASE_URL`
- `NEXT_PUBLIC_SFORMS_AUTH_BASE_URL`

---

## 9. Troubleshooting

- **Env dump**: `console.log(JSON.stringify(process.env, null,2))`.
- **Socket vs Port**: use `process.env.LSNODE_SOCKET`.
- **Global CSS**: import only in `pages/_app.tsx`.
- **Build paths**: ensure CWD aligns with `.next/` or set `dir: __dirname`.
- **next-transpile-modules**: point at real `../shared` folder.

---

With this, you have a reproducible local **dev** workflow, a **CI** friendly build pipeline, and a **Namecheap** compatible production deployment.