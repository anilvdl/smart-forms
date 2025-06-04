# Custom PostgreSQL Adapter for NextAuth.js

This library provides a secure, lightweight, and fully extensible PostgreSQL adapter for NextAuth.js without using ORMs like Prisma or TypeORM.

## Features

- Custom, renamed auth table schema for security
- Singleton pg.Pool connection with environment configuration
- Zod-based runtime validation for inputs
- Parameterized SQL queries to prevent injection
- Developer-friendly TypeScript codebase
- Extensible DAO pattern for additional features (CMS, forms, etc.)

## Tables

- `sf_users`: Auth users
- `sf_sessions`: Sessions for logged-in users
- `sf_accounts`: OAuth provider accounts
- `sf_verification_tokens`: For passwordless or email-based login

## Getting Started

1. Install dependencies:
   ```bash
   npm install pg zod
   ```

2. Apply schema:
   ```bash
   psql < schema.sql
   ```

3. Use in NextAuth config:
   ```ts
   import { PostgresAdapter } from './lib-db/adapter';

   export default NextAuth({
     adapter: PostgresAdapter(),
     ...
   });
   ```

## Environment

Set `DATABASE_URL` in your `.env`:
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

## Extending

- Add your DAOs under `lib-db/daos/`
- Create additional validation logic in `validator.ts`

---

Made with ❤️ for SmartForms