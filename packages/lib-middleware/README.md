# @smartforms/lib-middleware

A reusable library providing:

- A Fastify plugin for request/response logging, correlation IDs, and centralized error handling.
- HTTP client wrappers (axios & fetch) for correlation ID propagation.
- A Next.js API route wrapper for the same features.

## Installation

```bash
npm install @smartforms/lib-middleware
```

## Requirements

- Node.js >=14
- Fastify >=4
- Next.js >=12

## Usage

### Fastify plugin

```ts
import fastify from 'fastify';
import { middleware } from '@smartforms/lib-middleware';

const app = fastify({ logger: true });
app.register(middleware, {
  serviceName: 'backend-services',
  serviceVersion: '0.1.0',
  errorTypeBaseUrl: 'https://api.smartforms.com/errors'
});
```

### HTTP client

```ts
import { httpClient, fetchWithContext } from '@smartforms/lib-middleware';
```

### Next.js API routes

```ts
import { withMiddleware } from '@smartforms/lib-middleware';

export default withMiddleware(async (req, res) => {
  res.status(200).json({ message: 'Hello!' });
});
```
