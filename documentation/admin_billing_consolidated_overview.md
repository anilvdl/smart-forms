Below is a consolidated high-level overview for the Admin & Billing module:

---

## 1. High-Level Goals & Constraints
1. **Only “Admin” users** (the single or handful of people per customer/org) should see the Admin UI.
2. **Admin Capabilities**:
   - Manage other users (invite, revoke, assign roles/permissions within their account/organization).
   - See and edit billing/subscription details (plan type, usage, invoices, payment methods).
   - Grant permissions to different “developer” or “editor” roles in their org (e.g. who can build forms, who can see analytics, etc.).
   - Potentially view audit logs (e.g. “Who last changed the billing address?” or “Who created user X?”).
3. **Multi-Tenant Isolation**: Each “account” (org/customer) is multi-tenant—each record (forms, drafts, users, billing records) belongs to an account or “tenant.”
4. **Third-Party Billing**: We will integrate with a third-party billing provider (e.g. Stripe, Chargebee) rather than rolling our own credit-card-storage or invoicing.

---

## 2. Admin UI Feature Breakdown

### 2.1. Authentication & Routing
- Secure `/admin` route (e.g. `/admin/dashboard`).
- If non-admin authenticated user tries to hit `/admin/...`, return 403 or redirect to “not authorized” page.
- Use NextAuth (or similar) to detect `role="ADMIN"` in JWT/session.

### 2.2. Organization / Account Settings
- Display org name, address, contact email.
- Ability to update “company address” (for invoices), contact phone, etc.
- “Branding” section: upload logo, set default brand color, etc.

### 2.3. User Management
- List all users in your org: table showing email, role, last active, invitedAt.
- Invite new user by email → triggers an invitation email with a magic link.
- Edit an existing user’s role (Admin vs Developer vs Viewer).
- Revoke/deactivate a user.
- “Resend invitation” for pending invites.

### 2.4. Roles & Permissions
- Simple UI to define which roles exist (if dynamic roles are required).
- Each role maps to a set of permissions (e.g. “canCreateForm”, “canViewAnalytics”, “canEditBilling”).
- Store roles in the database and allow admin to tweak each role’s permissions. For v1, a fixed set of roles (Admin/Developer/Viewer) is acceptable.

### 2.5. Billing & Subscription
- Show current subscription plan (e.g. “Free”, “Pro”, “Enterprise”).
- Display next invoice date and usage summary (e.g. number of active forms, number of submissions) if relevant.
- “Change Plan” flow: select a new plan → confirm proration.
- “Update Payment Method”: redirect to Stripe Checkout/Portal or embed Stripe’s card-entry widget.
- “View Past Invoices”: show PDF downloads, invoice numbers, statuses.
- If the org is past due → show “Payment failed” banner, block certain features until payment is fixed.

### 2.6. Audit Logs / Activity History
- Table listing recent changes (e.g. “Alice changed billing address on 6/1/25 at 2:15 PM”).
- Optionally filter by event type (User invites, Billing, Role changes).

### 2.7. Support / Contact Info
- Sidebar or footer link to “Contact support” or “Docs.”
- Possibly embed a “Help” widget for admins.

---

## 3. Data Model & Backend Approach

### 3.1. Database Tables (PostgreSQL Schema)

1. **accounts**
   - `id` (UUID)
   - `name` (string)
   - `billing_status` (enum: `ACTIVE`, `PAST_DUE`, `CANCELED`)
   - `billing_plan` (enum: `FREE`, `PRO`, `ENTERPRISE`)
   - `billing_customer_id` (string, e.g. Stripe Customer ID)
   - `next_billing_date` (timestamp)
   - `created_at`, `updated_at`

2. **users**
   - `id` (UUID)
   - `email` (string, unique per account)
   - `hashed_password` (if storing locally; optional if OAuth)
   - `name` (string)
   - `account_id` (FK → `accounts.id`)
   - `role` (enum: `ADMIN`, `DEVELOPER`, `VIEWER`, etc.)
   - `status` (enum: `PENDING_INVITE`, `ACTIVE`, `SUSPENDED`)
   - `invited_at` (timestamp, nullable)
   - `last_login_at` (timestamp)
   - `created_at`, `updated_at`

3. **invites** (optional, if separate from `users`)
   - `id` (UUID)
   - `invited_email` (string)
   - `account_id` (FK → `accounts.id`)
   - `invited_by` (FK → `users.id`)
   - `token` (string) — cryptographically random invitation token
   - `expires_at` (timestamp)
   - `accepted_at` (timestamp, nullable)
   - `created_at`

4. **roles** (optional, for dynamic roles/perms)
   - `id` (UUID)
   - `account_id` (FK → `accounts.id`)
   - `name` (string, e.g. “BillingAdmin”, “FormEditor”)
   - `description` (string)
   - `created_at`

5. **permissions** (optional, for granular permission keys)
   - `id` (UUID)
   - `key` (string, e.g. `CAN_EDIT_BILLING`, `CAN_DELETE_USER`)

6. **role_permissions** (join table: `roles.id` + `permissions.id`)

7. **user_roles** (join table: `users.id` + `roles.id`) — if multiple roles per user

8. **audit_logs**
   - `id` (UUID)
   - `account_id` (FK → `accounts.id`)
   - `user_id` (FK → `users.id`)
   - `action` (string, e.g. `USER_INVITED`, `PLAN_CHANGED`)
   - `metadata` (JSON, e.g. `{ "oldPlan": "Free", "newPlan": "Pro" }`)
   - `created_at` (timestamp)

9. **invoices** (if mirroring Stripe invoices locally)
   - `id` (UUID)
   - `account_id` (FK → `accounts.id`)
   - `stripe_invoice_id` (string)
   - `amount_due` (integer, cents)
   - `amount_paid` (integer, cents)
   - `currency` (string)
   - `status` (enum: `PAID`, `OPEN`, `PAST_DUE`, `VOIDED`)
   - `invoice_date` (timestamp)
   - `pdf_url` (string, if storing hosted PDF)
   - `created_at`, `updated_at`

10. **payments** (optional, to record charges)
    - `id` (UUID)
    - `account_id` (FK → `accounts.id`)
    - `stripe_charge_id` (string)
    - `amount` (integer, cents)
    - `status` (enum: `SUCCEEDED`, `FAILED`)
    - `created_at` (timestamp)

**Notes**:
- If relying entirely on Stripe for invoice storage, local `invoices`/`payments` tables can be minimal (storing only Stripe IDs and metadata).
- If planning to support multiple payment processors, include fields like `processor` and `processor_id`.

---

### 3.2. Backend API Design

Endpoints are secured via NextAuth/JWT; only `role === 'ADMIN'` can access `/api/admin/...`.

#### 3.2.1. Authentication / Identity
- **GET** `/api/auth/session`  
  - Returns `{ user: { id, email, role, accountId } }`

#### 3.2.2. Account / Billing Endpoints
1. **GET** `/api/admin/account`  
   - Returns account-level info:  
     ```json
     {
       "name": "...",
       "billingPlan": "...",
       "billingStatus": "...",
       "nextBillingDate": "...",
       "usageStats": { /* e.g. form count, submission count */ }
     }
     ```
2. **PUT** `/api/admin/account`  
   - Payload: `{ name, address, contactEmail, companyLogoUrl, ... }`  
   - Updates organization details.

3. **GET** `/api/admin/invoices`  
   - Returns list of past invoices (either from local `invoices` table or proxied from Stripe).

4. **GET** `/api/admin/invoices/:invoiceId/pdf`  
   - Returns a URL (signed URL) or streams PDF content for download.

5. **POST** `/api/admin/billing/change-plan`  
   - Payload: `{ newPlan: "PRO" }`  
   - Action: Calls Stripe API to update subscription, returns updated subscription metadata.

6. **POST** `/api/admin/billing/update-card`  
   - Returns a Stripe SetupIntent client secret or Customer Portal URL for updating payment method.

#### 3.2.3. User Management Endpoints
1. **GET** `/api/admin/users`  
   - Returns list of users (active & pending invites) for `session.accountId`.

2. **POST** `/api/admin/users/invite`  
   - Payload: `{ email: string, role: string }`  
   - Action: Generate random `invite.token`, insert into `invites` table (or set `users.status = PENDING_INVITE`), send invitation email.

3. **POST** `/api/admin/users/:userId/role`  
   - Payload: `{ role: "DEVELOPER" | "VIEWER" | ... }`  
   - Action: Updates user’s role.

4. **DELETE** `/api/admin/users/:userId`  
   - Action: Soft-delete or deactivate user.

#### 3.2.4. Role/Permission Management Endpoints (Optional)
- **GET** `/api/admin/roles`  
- **POST** `/api/admin/roles`  
- **PUT** `/api/admin/roles/:roleId`  
- **DELETE** `/api/admin/roles/:roleId`  
- **POST** `/api/admin/roles/:roleId/permissions` (body: `[ "CAN_EDIT_BILLING", ... ]`)

#### 3.2.5. Audit Logs
- **GET** `/api/admin/audit-logs?limit=&page=&event=&userId=`  
  - Returns paginated audit log entries, filterable by event type or user.

---

## 4. Front-End (Next.js / React) Admin UI Structure

Assume pages under `/pages/admin/` (or App Router equivalent). Wrap with a shared `<AdminLayout>` that contains sidebar/navigation.

```
/pages
  /admin
    index.tsx            ← Redirects to /admin/dashboard
    dashboard.tsx        ← Overview (“Account at a glance”)
    /users
      index.tsx          ← List users + “Invite user” modal
      [userId].tsx       ← Edit single user details (role, status)
    /roles
      index.tsx          ← If dynamic role editing is required
    /billing
      index.tsx          ← Show current plan, usage, “change plan” UI
      invoices.tsx       ← List of invoices (click to download PDF)
      payment-method.tsx ← Update payment method (Stripe Elements or redirect)
    /settings
      index.tsx          ← Organization details (name, address, logo, tax info)
    /audit
      index.tsx          ← Audit log table + filters
```

### 4.1. `<AdminLayout>` Example

```tsx
// components/AdminLayout.tsx

import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">SmartForms Admin</h2>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="block px-2 py-1 hover:bg-gray-200 rounded">Dashboard</Link>
          <Link href="/admin/users" className="block px-2 py-1 hover:bg-gray-200 rounded">Users</Link>
          <Link href="/admin/billing" className="block px-2 py-1 hover:bg-gray-200 rounded">Billing</Link>
          <Link href="/admin/settings" className="block px-2 py-1 hover:bg-gray-200 rounded">Settings</Link>
          <Link href="/admin/audit" className="block px-2 py-1 hover:bg-gray-200 rounded">Audit Logs</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
```

### 4.2. Page Examples

**/pages/admin/dashboard.tsx**  
```tsx
import AdminLayout from '@/components/AdminLayout';
import useSWR from 'swr';

export default function AdminDashboard() {
  const { data, error } = useSWR('/api/admin/account', fetcher);

  if (error) return <div>Error loading account data.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Account Overview</h1>
      <div className="space-y-4">
        <div>Current Plan: <strong>{data.billingPlan}</strong></div>
        <div>Status: <strong>{data.billingStatus}</strong></div>
        <div>Next Billing Date: <strong>{new Date(data.nextBillingDate).toLocaleDateString()}</strong></div>
        {/* Optionally show usage stats */}
      </div>
    </AdminLayout>
  );
}
```

**/pages/admin/users/index.tsx**  
```tsx
import AdminLayout from '@/components/AdminLayout';
import useSWR from 'swr';
import { useState } from 'react';

export default function UsersPage() {
  const { data: users, mutate } = useSWR('/api/admin/users', fetcher);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('DEVELOPER');

  const handleInvite = async () => {
    await fetch('/api/admin/users/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    mutate();
  };

  if (!users) return <AdminLayout><div>Loading users...</div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <table className="w-full table-auto mb-6">
        <thead>
          <tr>
            <th className="px-2 py-1">Email</th>
            <th className="px-2 py-1">Role</th>
            <th className="px-2 py-1">Status</th>
            <th className="px-2 py-1">Invited At</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border px-2 py-1">{user.email}</td>
              <td className="border px-2 py-1">{user.role}</td>
              <td className="border px-2 py-1">{user.status}</td>
              <td className="border px-2 py-1">{user.invitedAt ? new Date(user.invitedAt).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold">Invite New User</h2>
        <div className="flex space-x-2 mt-2">
          <input
            type="email"
            placeholder="Email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="border px-2 py-1 rounded flex-1"
          />
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="border px-2 py-1 rounded">
            <option value="DEVELOPER">Developer</option>
            <option value="VIEWER">Viewer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button onClick={handleInvite} className="bg-blue-600 text-white px-4 py-1 rounded">Invite</button>
        </div>
      </div>
    </AdminLayout>
  );
}
```

---

## 5. Billing: Integration Details

### 5.1. Stripe Integration

1. **Billing Plans**  
   - Define plans (Free, Pro, Enterprise) each with a Stripe Price ID in your environment variables (or database).

2. **Customer Creation**  
   When a new “account” is created (first signup), call Stripe’s API:

   ```ts
   import Stripe from 'stripe';
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

   async function createCustomerInStripe(accountName: string, email: string) {
     const customer = await stripe.customers.create({
       name: accountName,
       email,
       metadata: { application: 'SmartForms' },
     });
     return customer.id; // store in accounts.billing_customer_id
   }
   ```

3. **Subscription Creation/Change**  
   - When Admin selects a paid plan (Pro/Enterprise), call:

   ```ts
   const subscription = await stripe.subscriptions.create({
     customer: billingCustomerId,
     items: [{ price: process.env.STRIPE_PRICE_PRO_ID! }],
     payment_behavior: 'default_incomplete',
     expand: ['latest_invoice.payment_intent'],
   });
   // Store subscription.id and plan details in accounts table
   ```

   - To change plan: `stripe.subscriptions.update(subscriptionId, { items: [{ price: NEW_PRICE_ID }] });`  
   - Store updated plan, update `accounts.billing_plan` and `accounts.next_billing_date`.

4. **Webhooks**  
   Expose `POST /api/stripe/webhook` and verify signature:

   ```ts
   import { buffer } from 'micro';
   import Stripe from 'stripe';

   export const config = { api: { bodyParser: false } };

   export default async function handler(req, res) {
     const sig = req.headers['stripe-signature']!;
     const buf = await buffer(req);
     let event: Stripe.Event;

     try {
       event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
     } catch (err) {
       return res.status(400).send(`Webhook Error: ${err.message}`);
     }

     switch (event.type) {
       case 'invoice.paid':
         const invoice = event.data.object as Stripe.Invoice;
         // Update local invoice record or mark Stripe invoice as paid
         break;
       case 'invoice.payment_failed':
         const failedInvoice = event.data.object as Stripe.Invoice;
         // Set accounts.billing_status = 'PAST_DUE'
         break;
       case 'customer.subscription.updated':
         const subscription = event.data.object as Stripe.Subscription;
         // Update accounts.billing_plan, next_billing_date
         break;
       // Handle other events as needed
       default:
         break;
     }
     res.json({ received: true });
   }
   ```

### 5.2. Client-Side “Change Plan” Flow

- On `/admin/billing/index.tsx`, show a dropdown of available plans.  
- When Admin clicks “Change Plan”:
  1. Call `POST /api/admin/billing/change-plan` with `{ newPlan: "PRO" }`.
  2. Backend updates Stripe subscription and returns updated subscription data.
  3. On success, revalidate SWR to display updated plan and next billing date.

- “Update Card”:  
  - Option A: Embed Stripe Elements form to collect new card details within your UI.  
  - Option B: Redirect Admin to Stripe Customer Portal (preferred for PCI compliance):

    ```ts
    // In your Next.js handler
    const session = await stripe.billingPortal.sessions.create({
      customer: billingCustomerId,
      return_url: process.env.NEXT_PUBLIC_BASE_URL + '/admin/billing',
    });
    res.redirect(303, session.url);
    ```

--- 

## 6. Questions / Clarifications to Confirm

1. **Multi-Tenant Scope**  
   - Is each “account” fully isolated (data-wise) from other accounts?  
   - Should an Admin be able to switch between multiple accounts (if they own more than one)?  
   - Are we strictly single-tenant per login (`user.account_id` is always unique)?

2. **Roles & Granularity**  
   - Do we need more than “Admin vs Non-Admin” (e.g. “Developer” vs “Viewer”)? Will Admin ever create new roles dynamically?  
   - Or is it okay to start with a fixed set: `ADMIN`, `DEVELOPER`, `VIEWER`?

3. **Invitation Mechanism**  
   - Should invites be “magic-link email” (token-based acceptance) or “temporary password emailed”?  
   - If an invite expires (after e.g. 7 days), how should we handle expired tokens?

4. **Billing Provider**  
   - Are we locked into Stripe, or might we use PayPal/Chargebee/Braintree later?  
   - Do we need to store invoice copies locally, or rely on Stripe’s hosted invoice PDFs?

5. **UI Organization**  
   - Should Admin UI live in the same Next.js monorepo under `/pages/admin`?  
   - Or would you prefer a separate React project / subdomain?

6. **Audit Log Depth**  
   - Should we capture “form published” / “form deleted” / “form settings changed”?  
   - Or only “Billing” & “User Management” events?  
   - Do we need to store old vs new values, or is a generic action description enough?

7. **Feature Flags / Staging**  
   - Do we need to hide certain billing plans (“Enterprise”) behind feature flags until launch?  
   - Would you like a “beta” toggle in Admin UI to opt into new features before GA?

---

## 7. Suggested Development Phases

**Phase 1: Core Admin & User Management**  
1. **DB Schema**  
   - Create `accounts` and `users` tables (with `role` enum).  
   - Add any missing columns to support invites and audit logging.

2. **API: Authentication & Authorization**  
   - Extend NextAuth/JWT to include `user.role` and `user.accountId` in session.  
   - Build middleware to guard `/api/admin/*` (require `role === 'ADMIN'` and correct `accountId`).

3. **API: User Management**  
   - `GET /api/admin/users` → list users for `session.accountId`.  
   - `POST /api/admin/users/invite` → create invite token, send email, set `status = PENDING_INVITE`.  
   - `POST /api/admin/users/:id/role` → update role.  
   - `DELETE /api/admin/users/:id` → deactivate user.  
   - Insert audit log entries for “user invited” and “role changed.”

4. **Admin UI: Users Page**  
   - `/admin/users/index.tsx`: table of users + “Invite User” form.  
   - SWR for data fetching and mutation.

5. **Audit Logging (Basic)**  
   - On user invites and role changes, insert into `audit_logs`.

---

**Phase 2: Billing Integration (Stripe)**  
1. **DB Schema**  
   - Add `accounts.billing_customer_id`, `accounts.billing_status`, `accounts.billing_plan`, `accounts.next_billing_date`.  
   - (Optional) `invoices` table to store Stripe invoice records.

2. **Stripe Webhook Endpoint**  
   - Expose `POST /api/stripe/webhook`, verifying signature.  
   - Handle `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated` to update `accounts`.

3. **API: Billing Endpoints**  
   - `GET /api/admin/billing` → return subscription details.  
   - `POST /api/admin/billing/change-plan` → call `stripe.subscriptions.update(...)`, return updated data.  
   - `POST /api/admin/billing/update-card` → return a Stripe Portal URL or SetupIntent client secret.  
   - `GET /api/admin/invoices` → list local invoices or proxy Stripe’s `/invoices` API.  
   - Insert audit log entries for “plan changed,” “card updated,” etc.

4. **Admin UI: Billing Pages**  
   - `/admin/billing/index.tsx`: current plan, usage, “Change Plan” dropdown, “Update Payment Method” button.  
   - `/admin/billing/invoices.tsx`: list past invoices with PDF download links.

---

**Phase 3: Roles/Permissions, Audit Logs & Refinements**  
1. **Dynamic Roles & Permissions (Optional)**  
   - Create `roles` and `permissions` tables plus join table `role_permissions`.  
   - CRUD endpoints under `/api/admin/roles` and `/api/admin/permissions`.  
   - UI under `/admin/roles/index.tsx` to manage roles → assign permissions.  
   - Update middleware to check `userHasPermission(session.user, 'CAN_EDIT_BILLING')`, etc.

2. **Enhanced Audit Logs**  
   - Page `/admin/audit/index.tsx`: SWR-fetch `/api/admin/audit-logs?page=1&pageSize=20`.  
   - Filters for event type, user.

3. **Account Settings Page**  
   - `/admin/settings/index.tsx`: show/edit account-level settings (company name, address, logo).  
   - Endpoints `GET /api/admin/account` and `PUT /api/admin/account`.

4. **Optional Impersonation / “Switch to Org”**  
   - Allow Admins to impersonate another user to see exactly what they see (useful for debugging).

5. **UI Responsiveness**  
   - Ensure Admin sidebar collapses gracefully on mobile or narrows screens.

---

## 8. TL;DR
1. **Database Tables**, **API Endpoints**, and **UI Pages/Modules** have been defined for Admin & Billing.  
2. **Key Questions** remain around:
   - Fixed vs dynamic roles.  
   - Invitation flow (magic-link vs password).  
   - Billing provider (Stripe vs others).  
   - Audit log depth.  
   - Admin UI organization (same repo vs separate).  
3. **Development Phases**:
   - Phase 1: User Management + Auth Guard.  
   - Phase 2: Billing (Stripe integration + Webhooks + UI).  
   - Phase 3: (Optional) Dynamic Roles/Permissions + Audit Logs + Settings.  
4. Let me know if you want a brand-new chat for “Admin/Billing” or prefer continuing here.

---

**End of Consolidated Overview**