# Admin & Billing Architecture and Development Plan

Below is a refined architecture and development plan that incorporates the provided clarifications.

---

## 1. Data Model (Postgres)

### 1.1. Core Tables

1. **accounts**  
   - `id` UUID PRIMARY KEY  
   - `name` VARCHAR  
   - `billing_status` ENUM(`ACTIVE`, `PAST_DUE`, `CANCELED`)  
   - `billing_plan` ENUM(`FREE`, `PRO`, `ENTERPRISE`)  
   - `billing_customer_id` VARCHAR → external ID (Stripe Customer ID, etc.)  
   - `next_billing_date` TIMESTAMP  
   - `created_at` TIMESTAMP, `updated_at` TIMESTAMP

2. **users**  
   - `id` UUID PRIMARY KEY  
   - `email` VARCHAR (unique across the entire platform)  
   - `name` VARCHAR  
   - `hashed_password` VARCHAR (nullable if SSO/OAuth)  
   - `status` ENUM(`PENDING_INVITE`, `ACTIVE`, `SUSPENDED`)  
   - `invited_at` TIMESTAMP (nullable)  
   - `last_login_at` TIMESTAMP (nullable)  
   - `created_at` TIMESTAMP, `updated_at` TIMESTAMP

3. **user_accounts** (join table for multi-tenancy)  
   - `user_id` UUID FK → `users.id`  
   - `account_id` UUID FK → `accounts.id`  
   - `role` ENUM(`ADMIN`, `DEVELOPER`, `VIEWER`)  
   - `is_active` BOOLEAN (if the user is still part of that account)  
   - `created_at` TIMESTAMP, `updated_at` TIMESTAMP  
   - **PK** (`user_id`, `account_id`)  

   _How it works:_ One row per (user, account) pair. A given user can be an `ADMIN` on account A, a `DEVELOPER` on account B, or inactive on account C.

4. **invites**  
   - `id` UUID PRIMARY KEY  
   - `invited_email` VARCHAR  
   - `account_id` UUID FK → `accounts.id`  
   - `invited_by` UUID FK → `users.id`  
   - `token` VARCHAR (cryptographically random)  
   - `expires_at` TIMESTAMP (default = `NOW() + INTERVAL '7 days'`)  
   - `accepted_at` TIMESTAMP nullable  
   - `created_at` TIMESTAMP  

   _Usage:_ When an `ADMIN` invites someone, we insert into `invites`. A background job (or DB constraint) can occasionally clean up expired invites.

5. **audit_logs**  
   - `id` UUID PRIMARY KEY  
   - `account_id` UUID FK → `accounts.id`  
   - `user_id` UUID FK → `users.id` (who triggered the action; nullable for system events)  
   - `event_type` VARCHAR (e.g. `USER_INVITED`, `PLAN_CHANGED`, `FORM_PUBLISHED`)  
   - `metadata` JSONB (store `{ "before": {...}, "after": {...} }` whenever relevant)  
   - `created_at` TIMESTAMP

6. **invoices**  
   - `id` UUID PRIMARY KEY  
   - `account_id` UUID FK → `accounts.id`  
   - `provider` VARCHAR (e.g. `stripe`, `paypal`, `zelle`)  
   - `provider_invoice_id` VARCHAR (external invoice identifier)  
   - `amount_due` INTEGER (cents)  
   - `amount_paid` INTEGER (cents)  
   - `currency` VARCHAR (e.g. `USD`, `INR`, `ZAR`)  
   - `status` ENUM(`PAID`, `OPEN`, `PAST_DUE`, `VOIDED`)  
   - `invoice_date` TIMESTAMP  
   - `due_date` TIMESTAMP  
   - `pdf_blob` BYTEA (binary PDF stored locally)  
   - `created_at` TIMESTAMP, `updated_at` TIMESTAMP

7. **feature_flags**  
   - `id` UUID PRIMARY KEY  
   - `flag_key` VARCHAR (e.g. `ENTERPRISE_PLAN_VISIBLE`, `BETA_FEATURE_X`)  
   - `description` TEXT  
   - `is_enabled` BOOLEAN (global toggle)  
   - `created_at` TIMESTAMP, `updated_at` TIMESTAMP  

   _We can expand this later to support per-account flags, but v1 will check the global boolean._

### 1.2. Relationships & Notes

- A single `users` row can appear multiple times in `user_accounts` for different `account_id`s.  
- The active account context is stored in the session after login; users can switch among the accounts listed in `user_accounts`.  
- Invitation flow inserts into both `invites` and (on acceptance) `users + user_accounts` in one transaction.  
- `audit_logs` records every action (user invites, role changes, billing events, form lifecycle events). The `metadata` JSONB holds `before`/`after` snapshots.  

---

## 2. Authentication & Session Management

### 2.1. Login Flow

1. **Email/Password or SSO**  
   - On sign-in, look up `users` by email (or via OAuth).  
   - If `status = PENDING_INVITE`, reject until they click their magic link.  
   - Once validated, fetch all `user_accounts` rows for that `user.id` where `is_active = true`.  
   - If the user belongs to exactly one active account, set that as `session.activeAccountId`.  
   - If they belong to multiple, after login show a “Choose Account” screen listing all `account_id + account_name` pairs; let them pick one to set as `session.activeAccountId`.  

2. **Session Object** (NextAuth JWT payload)  
   ```js
   {
     user: {
       id: '…',               // user.id
       email: '…',            // user.email
       name: '…',             // user.name
       accountIds: ['…','…'], // all accounts they belong to
       activeAccountId: '…',  // whichever they selected this session
       role: 'ADMIN' | 'DEVELOPER' | 'VIEWER', // role from user_accounts for activeAccountId
       status: 'ACTIVE'       // from users.status
     },
     expires: '…'
   }
   ```
   - Every request to `/api/admin/*` checks that `session.user.role === 'ADMIN'`.  
   - When switching accounts, the front end calls a new endpoint (e.g. `POST /api/auth/switch-account`) with `{ accountId: '…' }`. The server verifies that the `accountId` is in `session.user.accountIds` and, if so, updates `session.user.activeAccountId` and `session.user.role` accordingly.

---

## 3. API Design

All endpoints under `/api/admin/*` require:
1. Having a valid NextAuth session.
2. `session.user.status === 'ACTIVE'`.
3. `session.user.activeAccountId` set.
4. `session.user.role` checked (ADMIN vs DEVELOPER vs VIEWER).

### 3.1. Public/Unauthenticated Endpoints

- **POST** `/api/auth/invite/accept`  
  - Body: `{ token: string, name: string, password: string }`  
  - Action:  
    1. Lookup `invites` by `token`.  
    2. If not found or `expires_at < now()`, return 400 “Invite expired or invalid.”  
    3. Otherwise, create/update user record:  
       - If `users.email = invited_email` exists (status might be `PENDING_INVITE`), update `status = ACTIVE`, `name` and `hashed_password`.  
       - Else, insert new `users` row with given `email`, `name`, `hashed_password`, `status = ACTIVE`.  
    4. Insert into `user_accounts` for `(newUserId, account_id, role)` where `role` was captured in the original invite flow.  
    5. Set `invites.accepted_at = now()`.  
    6. Create a NextAuth session (JWT) with the new user’s `accountIds` + `activeAccountId = this account`.  
    7. Return `{ success: true }`.

### 3.2. Authentication Endpoints (NextAuth)

- **GET** `/api/auth/session`  
  - Returns the full session payload (including `user.accountIds`, `activeAccountId`, `role`).

- **POST** `/api/auth/switch-account`  
  - Body: `{ accountId: string }`  
  - Action:  
    1. Check that `accountId ∈ session.user.accountIds`.  
    2. Fetch `user_accounts` for `(session.user.id, accountId)` → get the `role`.  
    3. Update session’s `activeAccountId` and `role`.  
    4. Return updated session info.

### 3.3. Admin Endpoints (Require `role === 'ADMIN'`)

#### 3.3.1. Account & Settings

1. **GET** `/api/admin/account`  
   - Returns:  
     ```json
     {
       "id": "...",
       "name": "Acme Co.",
       "billingStatus": "ACTIVE",
       "billingPlan": "PRO",
       "nextBillingDate": "2025-07-01T00:00:00.000Z",
       "usageStats": { "formCount": 12, "submissionCount": 347 },
       "featureFlags": { "ENTERPRISE_PLAN_VISIBLE": true, "BETA_FEATURE_X": false }
     }
     ```

2. **PUT** `/api/admin/account`  
   - Body: `{ name?: string, address?: string, contactEmail?: string, logoUrl?: string }`  
   - Action: Update fields in `accounts` for `account_id = session.user.activeAccountId`.  
   - Insert into `audit_logs` with `event_type = "ACCOUNT_UPDATED"` and `metadata={ before: { … }, after: { … } }`.

#### 3.3.2. User Management

1. **GET** `/api/admin/users`  
   - Returns an array of all users (rows from `users` joined with `user_accounts`) for `session.user.activeAccountId`. For each:  
     ```json
     {
       "id": "...",
       "email": "...",
       "name": "...",
       "role": "ADMIN"|"DEVELOPER"|"VIEWER",
       "status": "ACTIVE"|"PENDING_INVITE"|"SUSPENDED",
       "invitedAt": "2025-06-10T15:00:00.000Z", // nullable
       "lastLoginAt": "2025-06-20T12:00:00.000Z" // nullable
     }
     ```

2. **POST** `/api/admin/users/invite`  
   - Body: `{ email: string, role: "DEVELOPER"|"VIEWER" }`  
   - Action:  
     1. Verify `session.user.role === 'ADMIN'`.  
     2. Generate a random `token` (e.g. `uuidv4()`), set `expires_at = now() + 7 days`.  
     3. Insert into `invites` with `(invited_email = email, account_id, invited_by = session.user.id, token, expires_at)`.  
     4. Send a magic-link email containing `https://your-domain.com/api/auth/invite/accept?token=${token}`.  
     5. Insert a placeholder into `users` if no `users.email = email` exists:  
        - `status = PENDING_INVITE`, `invited_at = now()`, `name = null`, `hashed_password = null`.  
     6. Insert into `user_accounts` with `(user_id, account_id, role, is_active = false)`.  
   - Insert into `audit_logs` with `event_type = "USER_INVITED"`, `metadata={ "invitedEmail": email, "role": role }`.

3. **POST** `/api/admin/users/:userId/role`  
   - Body: `{ role: "ADMIN"|"DEVELOPER"|"VIEWER" }`  
   - Action:  
     1. Verify `userId` belongs to the same `account_id`.  
     2. Update `user_accounts.role = role` and `is_active = true`.  
     3. Insert `audit_logs` entry:  
        ```json
        {
          "event_type": "USER_ROLE_CHANGED",
          "metadata": {
            "userId": "...",
            "oldRole": "DEVELOPER",
            "newRole": "ADMIN"
          }
        }
        ```

4. **DELETE** `/api/admin/users/:userId`  
   - Action:  
     1. Update `user_accounts.is_active = false`.  
     2. (Optionally) If this was the last `user_accounts` for that `account_id`, you might decide to auto-archive the account.  
     3. Insert `audit_logs`:
        ```json
        {
          "event_type": "USER_DEACTIVATED",
          "metadata": { "userId": "..." }
        }
        ```

#### 3.3.3. Billing & Subscription

> **Note:** Billing logic must be provider-agnostic. We’ll store which provider each account uses, plus all local invoice data, and route calls through a thin abstraction layer.

1. **GET** `/api/admin/billing`  
   - Returns:  
     ```json
     {
       "billingPlan": "PRO",
       "billingStatus": "ACTIVE",
       "nextBillingDate": "2025-07-01T00:00:00.000Z",
       "provider": "stripe" | "paypal" | "zelle",
       "usage": { "formCount": 12, "submissionCount": 347 },
       "availableProviders": ["stripe", "paypal", "zelle"]
     }
     ```

2. **POST** `/api/admin/billing/change-plan`  
   - Body: `{ newPlan: "FREE"|"PRO"|"ENTERPRISE" }`  
   - Action:  
     1. Determine `provider = accounts.provider`.  
     2. If `provider === 'stripe'`: call `stripe.subscriptions.update(stripeSubscriptionId, { items: [{ price: PRICE_ID_FOR(newPlan) }] })`.  
     3. If `provider === 'paypal'`: call PayPal Subscription API.  
     4. If `provider === 'zelle'`: mark local `accounts.billing_plan = newPlan` and set a flag to “Manual Payment Required.”  
     5. Update `accounts.billing_plan = newPlan`.  
     6. Insert `audit_logs`:
        ```json
        {
          "event_type": "PLAN_CHANGED",
          "metadata": {
            "oldPlan": "PRO",
            "newPlan": "ENTERPRISE",
            "provider": "stripe"
          }
        }
        ```

3. **POST** `/api/admin/billing/update-card`  
   - Body: _none_  
   - Action:  
     1. For `provider === 'stripe'`: generate a Billing Portal Session:
        ```ts
        const session = await stripe.billingPortal.sessions.create({
          customer: accounts.billing_customer_id,
          return_url: process.env.NEXT_PUBLIC_BASE_URL + '/admin/billing'
        });
        return { url: session.url };
        ```  
     2. For `provider === 'paypal'`: return the PayPal “Manage Billing” link from PayPal’s API.  
     3. For `provider === 'zelle'`: return `{ message: "Send payments to X through Zelle; update manually." }`.

4. **GET** `/api/admin/invoices`  
   - Query Params: `status?: 'PAID' | 'OPEN' | 'PAST_DUE' | 'VOIDED'`, `page?: number`, `limit?: number`  
   - Action:  
     1. SELECT * FROM `invoices` WHERE `account_id = session.user.activeAccountId` AND (`status = status` if provided).  
     2. Return a paged list of invoices (including `provider_invoice_id`, `amount_due`, `amount_paid`, `currency`, `status`, `invoice_date`, `due_date`).

5. **GET** `/api/admin/invoices/:invoiceId/pdf`  
   - Action:  
     1. Fetch the row from `invoices` by `invoiceId` and ensure it belongs to `session.user.activeAccountId`.  
     2. Return the binary PDF (`pdf_blob`) with appropriate `Content-Type: application/pdf` header.

6. **POST** `/api/admin/billing/provider`  
   - Body: `{ provider: "stripe"|"paypal"|"zelle" }`  
   - Action:  
     1. Update `accounts.provider = provider`.  
     2. If changing away from Stripe, you may want to deactivate/cancel the existing Stripe subscription and require manual handling.  
     3. Insert `audit_logs`:
        ```json
        {
          "event_type": "PROVIDER_CHANGED",
          "metadata": { "oldProvider": "stripe", "newProvider": "paypal" }
        }
        ```

#### 3.3.4. Audit Logs

1. **GET** `/api/admin/audit-logs`  
   - Query Params:  
     - `event?: string`  
     - `userId?: string`  
     - `page?: number` (default = 1)  
     - `limit?: number` (default = 20)  
   - Action:  
     1. SELECT * FROM `audit_logs`  
        WHERE `account_id = session.user.activeAccountId`  
        AND (`event_type = event` if provided)  
        AND (`user_id = userId` if provided)  
        ORDER BY `created_at` DESC  
        LIMIT `limit` OFFSET `(page - 1) * limit`.  
     2. Return rows with `(id, user_id, event_type, metadata, created_at)`.

#### 3.3.5. Feature Flags

1. **GET** `/api/admin/feature-flags`  
   - Returns all rows from `feature_flags`.

2. **PUT** `/api/admin/feature-flags/:flagKey`  
   - Body: `{ is_enabled: true | false }`  
   - Action: update `feature_flags.is_enabled`.

---

## 4. Front-End (Next.js) Structure

Keep everything in the same monorepo under `/pages/admin`. A shared `<AdminLayout>` wraps each page. The session hook provides:

```ts
const { data: session } = useSession();
// session.user = { id, email, name, accountIds, activeAccountId, role, status }
```

### 4.1. Account-Switcher Component

When `session.user.accountIds.length > 1`, show a drop-down in the header:

```tsx
// components/AccountSwitcher.tsx

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function AccountSwitcher() {
  const { data: session } = useSession();
  const [selected, setSelected] = useState(session.user.activeAccountId);

  const handleSwitch = async (newAccountId) => {
    await fetch('/api/auth/switch-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: newAccountId })
    });
    // Force a reload so role and data contexts update
    window.location.reload();
  };

  return (
    <select
      value={selected}
      onChange={(e) => {
        setSelected(e.target.value);
        handleSwitch(e.target.value);
      }}
      className="border px-2 py-1 rounded"
    >
      {session.user.accountIds.map((accountId) => (
        <option key={accountId} value={accountId}>
          {/* If you want to display account name, fetch via SWR or keep it in session */}
          Account {accountId.slice(0, 8)}
        </option>
      ))}
    </select>
  );
}
```

Include `<AccountSwitcher />` in `<AdminLayout>`’s header.

---

### 4.2. `/admin/dashboard.tsx`

```tsx
export default function AdminDashboard() {
  const { data: session } = useSession();
  const { data: accountData, error } = useSWR('/api/admin/account', fetcher);

  if (error) return <div>Error loading account info.</div>;
  if (!accountData) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {session.user.accountIds.length > 1 && <AccountSwitcher />}
      </div>

      <div className="space-y-4">
        <div>
          <strong>Account Name:</strong> {accountData.name}
        </div>
        <div>
          <strong>Plan:</strong> {accountData.billingPlan}
        </div>
        <div>
          <strong>Status:</strong> {accountData.billingStatus}
        </div>
        <div>
          <strong>Next Billing Date:</strong>{' '}
          {new Date(accountData.nextBillingDate).toLocaleDateString()}
        </div>
        <div>
          <strong>Usage:</strong> Forms: {accountData.usageStats.formCount}, Submissions: {accountData.usageStats.submissionCount}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Feature Flags</h2>
        <ul>
          {Object.entries(accountData.featureFlags).map(([flag, enabled]) => (
            <li key={flag}>
              {flag}: {enabled ? 'Enabled' : 'Disabled'}
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}
```

---

### 4.3. `/admin/users/index.tsx`

Fetch `/api/admin/users` and render a table. Invite form uses `POST /api/admin/users/invite`.

---

### 4.4. `/admin/billing/index.tsx`

```tsx
export default function BillingPage() {
  const { data: billingData, error } = useSWR('/api/admin/billing', fetcher);

  if (error) return <div>Error loading billing info.</div>;
  if (!billingData) return <div>Loading...</div>;

  const handleChangePlan = async (newPlan) => {
    await fetch('/api/admin/billing/change-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPlan }),
    });
    mutate('/api/admin/billing');
  };

  const handleUpdateCard = async () => {
    const res = await fetch('/api/admin/billing/update-card', { method: 'POST' });
    const { url } = await res.json();
    window.location.href = url; // redirect to Stripe/PayPal portal
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Billing</h1>
      <div className="mb-6">
        <div>
          <strong>Plan:</strong> {billingData.billingPlan}
        </div>
        <div>
          <strong>Status:</strong> {billingData.billingStatus}
        </div>
        <div>
          <strong>Next Billing:</strong>{' '}
          {new Date(billingData.nextBillingDate).toLocaleDateString()}
        </div>
        <div>
          <strong>Provider:</strong> {billingData.provider}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Change Plan</h2>
        <select
          defaultValue={billingData.billingPlan}
          onChange={(e) => handleChangePlan(e.target.value)}
          className="border px-2 py-1 rounded mr-2"
        >
          {billingData.provider === 'stripe' && ['FREE', 'PRO', 'ENTERPRISE'].map((plan) => (
            <option key={plan} value={plan}>{plan}</option>
          ))}
          {billingData.provider === 'paypal' && ['FREE', 'PRO'].map((plan) => (
            <option key={plan} value={plan}>{plan}</option>
          ))}
          {billingData.provider === 'zelle' && ['FREE', 'PRO', 'ENTERPRISE'].map((plan) => (
            <option key={plan} value={plan}>{plan}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <button onClick={handleUpdateCard} className="bg-blue-600 text-white px-4 py-1 rounded">
          Update Payment Method
        </button>
      </div>
    </AdminLayout>
  );
}
```

---

### 4.5. `/admin/billing/invoices.tsx`

```tsx
export default function InvoicesPage() {
  const { data: invoices, error } = useSWR('/api/admin/invoices', fetcher);

  if (error) return <div>Error loading invoices.</div>;
  if (!invoices) return <div>Loading...</div>;

  const downloadPdf = (invoiceId) => {
    window.open(`/api/admin/invoices/${invoiceId}/pdf`, '_blank');
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="px-2 py-1">Invoice #</th>
            <th className="px-2 py-1">Amount Due</th>
            <th className="px-2 py-1">Amount Paid</th>
            <th className="px-2 py-1">Status</th>
            <th className="px-2 py-1">Date</th>
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td className="border px-2 py-1">{inv.provider_invoice_id}</td>
              <td className="border px-2 py-1">{(inv.amount_due / 100).toFixed(2)} {inv.currency}</td>
              <td className="border px-2 py-1">{(inv.amount_paid / 100).toFixed(2)} {inv.currency}</td>
              <td className="border px-2 py-1">{inv.status}</td>
              <td className="border px-2 py-1">{new Date(inv.invoice_date).toLocaleDateString()}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => downloadPdf(inv.id)}
                  className="text-blue-600 hover:underline"
                >
                  Download PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
```

---

### 4.6. `/admin/audit/index.tsx`

```tsx
export default function AuditLogsPage() {
  const [filterEvent, setFilterEvent] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const { data: auditData, error } = useSWR(
    \`/api/admin/audit-logs?event=\${filterEvent}&userId=\${filterUserId}\`,
    fetcher
  );

  if (error) return <div>Error loading audit logs.</div>;
  if (!auditData) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Event Type"
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="User ID"
          value={filterUserId}
          onChange={(e) => setFilterUserId(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="px-2 py-1">Timestamp</th>
            <th className="px-2 py-1">User ID</th>
            <th className="px-2 py-1">Event</th>
            <th className="px-2 py-1">Details</th>
          </tr>
        </thead>
        <tbody>
          {auditData.map(log => (
            <tr key={log.id}>
              <td className="border px-2 py-1">{new Date(log.created_at).toLocaleString()}</td>
              <td className="border px-2 py-1">{log.user_id || 'System'}</td>
              <td className="border px-2 py-1">{log.event_type}</td>
              <td className="border px-2 py-1">
                <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
```

---

## 5. Billing Provider Abstraction

Instead of hard-coding Stripe calls everywhere, create a small service layer:

```ts
// services/billing.ts

import Stripe from 'stripe';
// import PayPal from '@paypal/sdk'; // hypothetical
// import ZelleProvider from './zelle'; // hypothetical

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export async function createProviderCustomer(provider: string, accountName: string, email: string) {
  switch (provider) {
    case 'stripe':
      const customer = await stripe.customers.create({
        name: accountName,
        email,
        metadata: { app: 'SmartForms' },
      });
      return customer.id;
    case 'paypal':
      // Call PayPal API to create customer
      break;
    case 'zelle':
      // Zelle is peer-to-peer, no standard customer object—maybe store bank details locally.
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function changeProviderPlan(
  provider: string,
  providerCustomerId: string,
  subscriptionId: string,
  newPlanKey: string
) {
  switch (provider) {
    case 'stripe':
      // Lookup the Stripe price ID for newPlanKey (could be stored in a config or DB).
      const priceId = process.env[`STRIPE_PRICE_ID_${newPlanKey}`];
      return await stripe.subscriptions.update(subscriptionId, {
        items: [{ price: priceId }],
      });
    case 'paypal':
      // Call PayPal subscription update
      break;
    case 'zelle':
      // Zelle: no automated subscription. Mark “manual payment required” in DB.
      return { status: 'MANUAL' };
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// Similarly, functions: `getProviderInvoices`, `downloadInvoicePdf`, `generateBillingPortalUrl`, etc.
```

- When you create a new account (e.g. on first signup), call `createProviderCustomer('stripe', accountName, email)`, store `accounts.billing_customer_id`.  
- Store `accounts.provider = 'stripe'` (or `'paypal'`/`'zelle'`) for future calls.

---

## 6. Audit Logging Everywhere

We need to log:
- **User-related events**: `USER_INVITED`, `USER_ROLE_CHANGED`, `USER_DEACTIVATED`, `INVITE_EXPIRED`, `INVITE_ACCEPTED`  
- **Billing-related events**: `PROVIDER_CHANGED`, `PLAN_CHANGED`, `INVOICE_CREATED`, `INVOICE_PAID`, `PAYMENT_FAILED`  
- **Form-related events**: `FORM_CREATED`, `FORM_UPDATED`, `FORM_PUBLISHED`, `FORM_DELETED`, `FORM_SETTINGS_CHANGED`  
- **Feature flag changes**: `FEATURE_FLAG_TOGGLED`  
- **Account settings changes**: `ACCOUNT_UPDATED`

Each time any of these actions occurs, insert an `audit_logs` row with `metadata: { before: {...}, after: {...} }` when applicable.

Example for a form update:

```ts
async function updateForm(formId: string, updatedFields: Partial<Form>) {
  // 1. Fetch oldForm from DB
  const oldForm = await FormDAO.getById(formId);
  // 2. Update
  const newForm = await FormDAO.update(formId, updatedFields);
  // 3. Insert into audit_logs
  await db('audit_logs').insert({
    account_id: oldForm.account_id,
    user_id: session.user.id,
    event_type: 'FORM_UPDATED',
    metadata: JSON.stringify({ before: oldForm, after: newForm }),
    created_at: new Date(),
  });
  return newForm;
}
```

---

## 7. Feature Flags

Use the `feature_flags` table to hide UI elements or backend flows.

- In front end, fetch `/api/admin/feature-flags` and store in a React context. Components read `featureFlags['ENTERPRISE_PLAN_VISIBLE']` to decide whether to render “Enterprise” in the plan dropdown.  
- When creating a new plan in the DB, you can toggle `ENTERPRISE_PLAN_VISIBLE` to false until launch.  
- For beta features, wrap UI code in:  
  ```tsx
  {featureFlags['BETA_FEATURE_X'] && <BetaComponent />}
  ```

---

## 8. Development Phases

### Phase 1: Core Multi-Account & User Management

1. **Migrations**  
   - Create tables: `accounts`, `users`, `user_accounts`, `invites`, `audit_logs`, `feature_flags`.  
   - Ensure `users.email` is unique.  
   - Seed `feature_flags` with keys like `ENTERPRISE_PLAN_VISIBLE = false`, `BETA_FEATURE_X = false`.

2. **NextAuth Customization**  
   - After login, load all active `user_accounts` rows for that user.  
   - If `accountIds.length > 1`, redirect to `/admin/select-account` (a new page where they choose).  
   - On selection, call `POST /api/auth/switch-account` to update `session.user.activeAccountId` and `session.user.role`.  
   - Enforce that every `/admin/*` route checks `session.user.role === 'ADMIN'` (via middleware).

3. **Invitation Flow**  
   - Implement `POST /api/admin/users/invite`.  
   - Generate `token`, insert into `invites` with `expires_at = now()+7 days`.  
   - Insert or upsert `users` row with `status = PENDING_INVITE`.  
   - Insert into `user_accounts` with `is_active = false`.  
   - Send email (SMTP or SendGrid) with magic-link to `/api/auth/invite/accept?token=…`.  
   - Build `GET /api/auth/invite/accept` handler: validate token, check expiry, create/update `users.status = ACTIVE`, insert into `user_accounts` with `is_active = true`. Then log into session.

4. **User Management UI**  
   - Build `/admin/users/index.tsx` to list all users (active & pending) for `session.user.activeAccountId`.  
   - Add “Invite” form. On success, refresh SWR.  
   - Build `POST /api/admin/users/:userId/role` to change role, set `is_active = true`.  
   - Build `DELETE /api/admin/users/:userId` to deactivate (set `is_active = false`).  
   - Insert `audit_logs` entries for each action.

5. **Audit Log Schema**  
   - Insert basic rows when invites are sent/accepted, roles changed, users deactivated.  
   - Create `/admin/audit/index.tsx` to view logs with filters.

---

### Phase 2: Billing Abstraction & Provider Integration

1. **Migrations**  
   - Alter `accounts` to add `provider` (VARCHAR), `subscription_id` (VARCHAR), `billing_plan`, `billing_status`, `billing_customer_id`, `next_billing_date`.  
   - Create `invoices` table with local PDF storage (`pdf_blob`).

2. **Provider Service Layer** (`services/billing.ts`)  
   - Implement `createProviderCustomer(provider, accountName, email)`.  
   - Implement `changeProviderPlan(provider, customerId, subscriptionId, newPlan)`.  
   - Implement `getProviderInvoices(provider, customerId)` to fetch invoice metadata from Stripe/PayPal.  
   - Implement `downloadInvoicePdf(provider, invoiceId)` → fetch from Stripe and store in `invoices.pdf_blob` (once per invoice).  
   - For non-automated providers (Zelle), store local records and mark `status = 'MANUAL'`.

3. **Stripe Webhook Endpoint**  
   - `POST /api/stripe/webhook` (protected via signature).  
   - Handle:
     - `invoice.paid`: insert or update a row in `invoices` with `status = 'PAID'` + store `pdf_blob` via `stripe.invoices.retrieve({ id }).invoice_pdf`.  
     - `invoice.payment_failed`: update `invoices.status = 'PAST_DUE'`, update `accounts.billing_status = 'PAST_DUE'`.  
     - `customer.subscription.updated`: update `accounts.billing_plan`, `accounts.next_billing_date = subscription.current_period_end`.

4. **Billing API Endpoints**  
   - Build `GET /api/admin/billing`. Return plan, status, next date, provider, usage, feature flags.  
   - Build `POST /api/admin/billing/change-plan`.  
   - Build `POST /api/admin/billing/update-card`. Return provider’s Customer Portal URL.  
   - Build `GET /api/admin/invoices` & `GET /api/admin/invoices/:invoiceId/pdf`.

5. **Billing UI**  
   - `/admin/billing/index.tsx`: show current plan/status, “Change Plan” dropdown, “Update Payment Method” button.  
   - `/admin/billing/invoices.tsx`: list invoices, “Download PDF” action.

6. **Audit Logs for Billing**  
   - Log each provider change, plan change, invoice creation, invoice payment, payment failure.

---

### Phase 3: Form-Related Audit & Feature Flags

1. **Form Audit Integration**  
   - Wherever forms are created/updated/published/deleted, wrap the DAO functions so that after any mutation, an `audit_logs` row is inserted with `event_type` (e.g. `FORM_CREATED`) and `metadata = { before: {...}, after: {...} }`.  
   - For simple deletes or publishes, store at least `{ formId, oldStatus, newStatus }` in `metadata`.

2. **Feature Flags Management**  
   - Build `GET /api/admin/feature-flags` and `PUT /api/admin/feature-flags/:flagKey`.  
   - UI under `/admin/settings/feature-flags.tsx`: list all flags, toggle on/off.  

3. **Conditional UI Rendering**  
   - Wrap “Enterprise” plan option under `featureFlags['ENTERPRISE_PLAN_VISIBLE']`.  
   - For any beta functionality (e.g. new UI workflows), wrap in `featureFlags['BETA_FEATURE_X']`.

4. **Account Settings Page**  
   - `/admin/settings/index.tsx`: show/edit account‑wide fields: `name`, `address`, `contactEmail`, `logoUrl`.  
   - Call `GET /api/admin/account` & `PUT /api/admin/account`.

---

### Phase 4: Final Polish, Testing, and Release

1. **End-to-End Testing**  
   - Sign up flows (creating first account, auto-creating Stripe Customer).  
   - Multi-account scenario: manually insert a second `user_accounts` row for the same user under a new account; confirm switch flow works.  
   - Magic-link invites expire in 7 days. Test expired tokens.  
   - Billing: test Stripe payments in test mode, generate real invoices, download PDFs, pay/fail flows.  
   - Test PayPal or mock a second provider to ensure multi-provider abstraction works.  
   - Test Zelle “manual” flows.

2. **Role & Permission Lock-Down**  
   - Ensure non-Admin users (developers, viewers) cannot access `/admin/*`.  
   - Developers only see form-builder pages, cannot see billing or user management.

3. **Mobile & Responsive UI**  
   - Ensure sidebar collapses for narrow screens.  
   - Account switcher visible on all admin pages.

4. **Feature Flag Launch**  
   - Toggle `ENTERPRISE_PLAN_VISIBLE` to `true` just before enabling the Enterprise plan.  
   - Expose any beta features behind `BETA_FEATURE_X` until complete.

5. **Documentation & Handover**  
   - Document all new API endpoints, data models, and front-end components.  
   - Provide a high-level README in `/admin/README.md` explaining how to scaffold and deploy the Admin UI.

---

## 9. Remaining Questions / Clarifications

1. **International Providers**  ------ sure, will follow the same
   - When integrating PayPal or Zelle, will you need a separate domestic “Zelle business account” or just instruct users manually? We assume Zelle requires no server callbacks, so invoices must be marked paid manually once fund confirmation arrives.  
   - For India (e.g., Razorpay, UPI): you’ll need a slightly different API layer. We can model it after the `provider` abstraction created in Phase 2.

2. **Form-Related Events**  ------- yes, based on this we can send followup emails till the end date reaches or form validity period expires, opted by the author or admin or creator
   - Should we also log “FORM_VIEWED” whenever a published form is loaded by an end user? Right now, we’re only capturing CRUD actions on forms within the builder.

3. **Account Ownership Transfer**   ----- yes
   - If an `ADMIN` wants to leave an account or transfer ownership to another user, do we need a special endpoint for that? We can build `POST /api/admin/users/:userId/transfer-ownership` if needed.

4. **Invoice PDF Storage & Size**  ------ first try in db later we can move to filesystems
   - Storing every invoice PDF in `invoices.pdf_blob` can bloat the DB. Would you prefer storing a filesystem link (e.g. S3 path) instead? For now, we store the binary in the DB; it’s easy to swap to S3 later.

5. **Feature Flag Granularity**  ------ this is fine, also some of the features we will mark as higher paid customers only, if the customer opts the feature need to display message like upgrade to use this feature
   - In v1 we have global flags. Eventually, if per-account flags are needed (e.g. only certain customers see Beta), we can add a `account_id` column to `feature_flags`.

Once you confirm (or clarify) these final questions, we’ll have a rock-solid blueprint and can begin writing migrations, endpoints, and UI code.
