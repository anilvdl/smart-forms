Below is an initial, high-level sketch of what an “Admin & Billing” module might look like (UI pages, API surfaces, data model, and integration points), followed by a set of clarification questions. Once we have answers, we can lock in the detailed architecture and break it into development phases.

---

## 1. High-Level Vision

### 1.1. Key Functional Areas
1. **Account Management (Tenants/Organizations)**
   - Create new “Accounts” (e.g. Acme Co.) and assign a primary “Account Admin” (root-like privileges).
   - Invite additional users under that Account (with roles: Admin, Billing-Only, Editor, etc.).
   - Enable Admins to view/modify Account-wide settings (name, logo, contact email, etc.).

2. **User & Role Management**
   - Each Account has its own set of Users.
   - Roles/Permissions:
     - **Account Admin**: full rights to billing, user invites, role grants, settings.
     - **Billing Manager**: view/pay invoices but cannot modify form templates, etc.
     - **Form Editor** (existing): can create/edit forms, but no billing/UI-admin rights.
     - **Read-Only** (optional): view dashboards, usage stats, but no edits.
   - RBAC (Role-Based Access Control) tables to map Users → Roles → Permissions.

3. **Billing & Subscription**
   - **Plans & Pricing**: Define pricing tiers (e.g., Free, Pro, Enterprise).  
   - **Subscription Lifecycle**: 
     1. Sign up → choose a Plan → enter payment details (Stripe/PayPal/others).
     2. System creates a “Subscription” record (status: active/past-due/canceled).
     3. Recurring billing (monthly/yearly) or one-time invoices.
   - **Invoices & Payments**:
     - Store Invoice records (date issued, due date, line-items, total).
     - Track Payment status (paid/unpaid/failed).
     - Allow Admin to view past invoices, download PDF, pay outstanding balances.
     - Automatic retry logic (e.g., if card declines).
   - **Usage Metering** (optional v1):
     - Track number of active forms, submissions, or API calls to compute usage charges.
   - **Notifications**:
     - Email or in-app alerts for upcoming renewals, failed payment, plan downgrade, etc.

4. **Admin UI**
   - **Dashboard (Admin Home)**
     - At-a-glance: Current Plan, next billing date, total invoices, payment status.
     - Quick links: “Change Plan”, “View Invoices”, “Invite Users”, “Audit Logs”.
   - **User & Role Management Page**
     - Invite new users (by email), assign roles.
     - List existing users, change role, deactivate/reactivate.
   - **Billing Page**
     - **Subscription Details**: Current plan, next renewal, upgrade/downgrade options.
     - **Payment Method**: add/remove credit card, set default.
     - **Invoices List**: paginated list of past invoices (with filters: paid, unpaid).
     - **Pay Invoice**: If an invoice is past-due, allow one-click payment.
   - **Account Settings**
     - Update organization name, address, tax info, invoice recipient.
     - Configure billing contact email/phone.

5. **Backend Microservices**
   - **“Admin” Routes (Fastify)**
     - `/admin/accounts` → create/edit Account, fetch Account metadata.
     - `/admin/users` → invite user, list users, update role, remove user.
     - `/admin/roles` → list available roles, map permissions.
   - **“Billing” Routes (Fastify)**
     - `/billing/plans` → list pricing tiers.
     - `/billing/subscriptions` → create/update/cancel subscription.
     - `/billing/invoices` → list, retrieve an invoice (and PDF URL).
     - Webhook endpoints for payment provider events (e.g., `POST /billing/webhooks/stripe`).
   - All Admin/Billing routes protected by checks on `session.user.role` (must be Account Admin or Billing Manager).

6. **Data Model (Postgres Tables)**
   1. **accounts**
      - `id (PK)`, `name`, `domain` (optional), `logo_url`, `created_at`, `updated_at`.
   2. **users**
      - `id (PK)`, `email`, `hashed_password`, `name`, `account_id (FK → accounts.id)`, `role_id (FK → roles.id)`, `is_active`, `created_at`, `updated_at`.
   3. **roles**
      - `id (PK)`, `name` (e.g., “Account Admin”, “Billing Manager”, “Form Editor”), `description`.
   4. **permissions**
      - `id (PK)`, `name` (e.g., `manage_users`, `view_billing`, `modify_settings`), `description`.
   5. **role_permissions** (join table)
      - `role_id (FK → roles.id)`, `permission_id (FK → permissions.id)`.
   6. **plans**
      - `id (PK)`, `sku` (string), `name`, `price_cents` (integer), `interval` (enum: “monthly”/“yearly”), `features` (JSONB), `created_at`, `updated_at`.
   7. **subscriptions**
      - `id (PK)`, `account_id (FK → accounts.id)`, `plan_id (FK → plans.id)`, `status` (enum: “active”/“past_due”/“canceled”), `start_date`, `current_period_end`, `external_subscription_id` (from payment gateway), `created_at`, `updated_at`.
   8. **invoices**
      - `id (PK)`, `subscription_id (FK → subscriptions.id)`, `account_id (FK → accounts.id)`, `invoice_number` (string), `amount_due_cents`, `amount_paid_cents`, `status` (enum: “open”/“paid”/“void”), `invoice_date`, `due_date`, `pdf_url`, `created_at`, `updated_at`.
   9. **payment_methods**
      - `id (PK)`, `account_id (FK → accounts.id)`, `external_pm_id` (gateway’s ID), `brand`, `last4`, `exp_month`, `exp_year`, `is_default` (bool), `created_at`, `updated_at`.

7. **Third-Party Integrations**
   - **Payment Provider** (e.g., Stripe, Braintree, PayPal):
     - Host checkout flows or card forms (PCI-compliant).
     - Call webhook to update subscription/invoice status.
   - **Email Service** (SendGrid, SES, etc.) for billing notifications and user invitations.

8. **Security & Access Control**
   - Protect admin routes with JWT session guard in Next.js API (and Fastify).
   - At the Fastify layer, inspect `session.user.role` → allow or reject.
   - Sensitive actions (e.g., “cancel subscription”) require an extra confirmation (2FA?).
   - Audit log table (optional v1) to record who performed key actions.

9. **Admin UI Tech Stack**
   - **Front-End**: Next.js + Tailwind CSS (consistent with existing SmartForms UI).
     - Use `@/components/ui` primitives (Buttons, Cards, Tables).
     - Build pages under `/pages/admin/…` (Next.js App Router or Pages Router based on current setup).
     - Leverage SWR (or React Query) for data fetching, optimistic updates.
   - **Back-End**: Fastify microservice (already running “forms” routes).
     - Add new route modules under `backend-services/src/routes/admin.ts` and `billing.ts`.
     - Reuse existing database connection code (Postgres) with Knex or Prisma (depending on existing DAO approach).
   - **Notifications & Webhooks**: A small worker/service to handle payment provider webhooks.

---

## 2. Clarification Questions

Below are grouped questions to iron out requirements. Your answers will shape the final architecture, data model, and dev timeline.

### 2.1. Account & User Model

1. **Account Hierarchy**
   - Will there be a single “root Admin” per Account, or can multiple users share the same full-Admin role?
   - Do we need to support multiple Accounts per user (e.g., someone might administer two separate organizations)? Or is each user tied to exactly one Account?

2. **Roles & Permissions**
   - Besides “Account Admin” and “Billing Manager,” do you foresee other roles in v1? For instance:
     - **Form Viewer** (read-only on forms, no billing UI).
     - **Support Agent** (limited access to user lists, invoices, but not full Admin).
   - Should we allow custom, per-Account roles/permissions, or keep a fixed set of roles globally?
   - Do permissions need to be more granular than “manage_users” / “view_billing” / “modify_settings,” etc.? (e.g., “invite_user” vs “deactivate_user” as separate permissions)

3. **User Invitations**
   - When an Account Admin invites a user by email, should the invite link:
     1. Create a brand-new user record (for emails never seen before)?
     2. Allow existing users (onboarding them into this Account) to accept?
   - Do invited users need to set a password (existing NextAuth flow)? Or is it more of a Single-Sign-On (SSO) scenario?

---

### 2.2. Billing & Subscription Model

4. **Pricing Tiers & Plans**
   - Do we already have defined plan names, prices, and billing intervals? Or are you expecting a dynamic admin UI to **create/edit** “Plans” (e.g., “Pro – $29/mo,” “Enterprise – custom”)?
   - Is usage metering part of v1 (e.g., bill by number of form submissions or API calls), or do we bill simply by “seat” or flat rate?

5. **Payment Provider**
   - Which gateway are you planning to integrate (Stripe, Braintree, PayPal)? If not decided, do you have any constraints (e.g., PCI-compliance level, regional availability)?
   - Do you intend to host your own card-capture form (collect and vault card details) or redirect to a hosted checkout page?

6. **Subscription Lifecycle**
   - Should Admins be able to upgrade/downgrade plans at any time, with proration handled automatically?
   - Do we need to support coupons or promo codes at signup?
   - What happens on payment failure? (E.g., do we suspend the Account immediately, allow a grace period, or keep forms running in “read-only” mode?)

7. **Invoicing & Taxes**
   - Do you need to generate fully itemized invoices (line items, tax breakdown)? Or is a simple “monthly flat fee” invoice sufficient for v1?
   - Will you handle tax calculations (VAT, sales tax) yourselves, or offload that to the payment provider?
   - Are invoices to be downloadable as PDFs? If so, should we generate them on our side (e.g., fill a template and PDF-render), or rely on the gateway’s invoice PDFs?

8. **Payment History & Statements**
   - Should Admins see a full list of past payments (even outside the subscription flow)? For example:
     - One-time add-on charges?
     - Refunds or credits?
   - Do we need to support exporting payment history to CSV/Excel?

---

### 2.3. Workflows & Notifications

9. **Notifications**
   - Which email events should we trigger?
     1. **Invoice Issued** (to primary billing contact).
     2. **Upcoming Renewal Reminder** (e.g., 7 days before payment).
     3. **Payment Failed** (notify Admin and optionally Billing Manager).
     4. **Subscription Canceled** (alert Admin).
   - Should notifications also appear in an in-app “Bell” icon? Or email only is fine?

10. **Audit Logging**
    - Do you require an audit log for every Admin action (e.g., “Alice invited Bob,” “Carol changed plan from Pro to Enterprise during trial”)?
    - If so, is a simple DB table (timestamp/user/action/details) sufficient, or do we need something more robust (e.g., immutable event store)?

11. **Edge Cases & Self-Service**
    - If an Admin deletes their own account or transfers ownership, what should happen to the Account and Billing?
    - Should Admins be able to regenerate API keys or reset SSO credentials from the Admin UI?

---

### 2.4. Integration & Deploy

12. **Tech Stack Constraints**
    - We’re assuming Next.js (front end) + Fastify (back end) + Postgres (DB). Any other services or constraints (e.g., you already use Prisma, or prefer raw SQL with Knex)?
    - Do you have preference for how we handle migrations (Knex migrations, Prisma Migrate, or raw SQL)?

13. **Deployment & Environments**
    - Will the Billing microservice be a separate container (e.g., a new Docker service) alongside existing “backend-services,” or do you want it merged into the same codebase?
    - Are there any CI/CD considerations (e.g., deployment windows, database downtime) we need to factor into the timeline?

14. **Timeline & Phasing**
    - Do you need the Admin UI and Billing module to go live simultaneously, or can we release Billing in a “beta” phase before rolling out full User Mgmt?
    - Are there any hard launch dates (e.g., “We must have invoices live by September 1”)?

---

## 3. Next Steps

1. **Answer the Above Questions.**  
   Now that you’ve seen the broad strokes, please let me know any details around roles, billing flows, payment provider, invoicing requirements, notifications, and deployment constraints.

2. **Refine the Data Model & API Contract.**  
   Once clarified, I’ll provide a finalized ER diagram (tables/fields), list of new API endpoints with request/response shapes, and RBAC middleware logic.

3. **Outline Development Phases & Sprint Plan.**  
   We’ll break the work into phases, for example:
   - **Phase 1**: Data model & DB migrations + basic user/role tables + stub admin UI page.
   - **Phase 2**: User invitation flow + role-assignment UI + backend endpoints.
   - **Phase 3**: Billing plan CRUD + subscription creation + payment provider integration + webhook handlers.
   - **Phase 4**: Invoice generation & listing + PDF download + payment retry logic.
   - **Phase 5**: Notifications, audit logs, and final polish.

4. **Begin Detailed Implementation.**  
   After phasing is approved, we’ll start writing the React/Next.js pages, SWR hooks, Fastify routes, and DB migration scripts in sequence—always ensuring existing form-builder functionality remains untouched.


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

1. **International Providers**  
   - When integrating PayPal or Zelle, will you need a separate domestic “Zelle business account” or just instruct users manually? We assume Zelle requires no server callbacks, so invoices must be marked paid manually once fund confirmation arrives.  
   - For India (e.g., Razorpay, UPI): you’ll need a slightly different API layer. We can model it after the `provider` abstraction created in Phase 2.

2. **Form-Related Events**  
   - Should we also log “FORM_VIEWED” whenever a published form is loaded by an end user? Right now, we’re only capturing CRUD actions on forms within the builder.

3. **Account Ownership Transfer**  
   - If an `ADMIN` wants to leave an account or transfer ownership to another user, do we need a special endpoint for that? We can build `POST /api/admin/users/:userId/transfer-ownership` if needed.

4. **Invoice PDF Storage & Size**  
   - Storing every invoice PDF in `invoices.pdf_blob` can bloat the DB. Would you prefer storing a filesystem link (e.g. S3 path) instead? For now, we store the binary in the DB; it’s easy to swap to S3 later.

5. **Feature Flag Granularity**  
   - In v1 we have global flags. Eventually, if per-account flags are needed (e.g. only certain customers see Beta), we can add a `account_id` column to `feature_flags`.

Once you confirm (or clarify) these final questions, we’ll have a rock-solid blueprint and can begin writing migrations, endpoints, and UI code.


# Admin & Billing – Granular Architecture & Development Plan

Below is a detailed breakdown incorporating your answers/comments, followed by specific follow-up questions and a step-by-step development plan.

---

## 1. Integration of Your Answers

1. **International Providers**  
   - We’ll keep the same `provider` abstraction (Stripe/PayPal/Zelle/Razorpay/UPI, etc.). No extra server callbacks for Zelle—teams will manually mark invoices paid. For Indian gateways (Razorpay, UPI), we’ll add new branches in `services/billing.ts` (e.g. `case 'razorpay': …`).  

2. **Form-Related Events (Including `FORM_VIEWED`)**  
   - We’ll extend audit logging to capture `FORM_VIEWED`.  
   - We’ll create a new table (e.g. `form_views`) to store each “view by end user” event, with a timestamp and optional visitor identifier or IP.  
   - That table can feed a scheduled job (cron) that sends follow-up emails up until the form’s end date, as chosen by the form’s author/admin.  

3. **Account Ownership Transfer**  
   - We’ll add a new endpoint:
     ```
     POST /api/admin/users/:userId/transfer-ownership
     body: { newAdminUserId: UUID }
     ```
   - This will validate that `:userId` is the current owner (role=`ADMIN` on that account), then update `user_accounts.role` so that `newAdminUserId` becomes `ADMIN` and optionally demote the old owner to `DEVELOPER` (or remove).

4. **Invoice PDF Storage & Size**  
   - For v1 we’ll store `pdf_blob` in the `invoices` table. Later, we can migrate to S3 (or another object store) by:  
     1. Adding a new column `pdf_path VARCHAR` (e.g. S3 URL),  
     2. Copying existing `pdf_blob` data to files and updating `pdf_path`,  
     3. Dropping `pdf_blob` column.

5. **Feature Flag Granularity**  
   - We’ll begin with global flags (`feature_flags.is_enabled`).  
   - In the UI, whenever a user tries to access a flag-protected feature and their account’s plan doesn’t allow it, we’ll show a “This feature requires an upgrade” banner.  
   - Later (Phase 3), we can extend `feature_flags` to include an optional `account_id` so we can enable flags per customer.

---

## 2. Detailed Follow-Up Questions

1. **Form-Viewed Tracking & Follow-Up Emails**  
   - **Data to capture:**  
     - Do you need to track each individual view (e.g., store one row per view in `form_views`), or is counting unique users/sessions enough?  
     - Should we capture any visitor metadata (IP address, user agent, or a unique “visitorId” cookie) to avoid duplicate counts?  
   - **Email cadence:**  
     - When a form is published, should we schedule follow-up emails automatically, or only after the author/admin “opts in”?  
     - How often should follow-ups go out? For example, if a form’s end date is July 31 and someone views on July 1, do we send a reminder daily/weekly until July 31?  
     - Will follow-ups be triggered by a background worker/cron job (e.g., once per day scan `form_views` and “send email if today < endDate”), or should we enqueue an individual delayed job at view time?

2. **Account Ownership Transfer Behavior**  
   - If an Admin “leaves” or transfers ownership:  
     - Should the old owner keep any role (e.g., automatically demote to `DEVELOPER`), or be completely removed from `user_accounts`?  
     - Can ownership transfer happen to a user who is currently inactive or just to an existing active member?  
     - After transfer, if the new owner leaves, does the API allow another transfer, or do we require a support ticket?

3. **Invoice Retention & Cleanup**  
   - How long do you want to keep old invoice PDFs in the DB before migrating them off or purging?  
   - Do you need any automated cleanup policy (e.g., archive invoices older than 2 years to S3)?

4. **Feature Flag Overrides & “Upgrade to Use” Messaging**  
   - For features restricted to higher-tier customers, shall the front end check both:  
     1. `featureFlags['FEATURE_X'] === true`  
     2. `session.account.billing_plan` is in the allowed list (e.g., `['PRO', 'ENTERPRISE']`)?  
   - If a non-eligible user attempts to access, should we:  
     - Show a modal (“Upgrade your plan to access Feature X”), or  
     - Grey out the UI element entirely?

5. **Multi-Currency, Multi-Provider Details**  
   - When the provider is Razorpay/UPI (India) or PayPal (various regions), do you want to store exchange rates or assume each invoice’s `amount_due`/`amount_paid` come in the local currency?  
   - Do we need a “billing_settings” table per account (e.g., `preferred_currency`, `tax_id`, `bank_details`)?

---

## 3. Granular Development Plan

Below is a breakdown into very specific tasks (roughly grouped by sub-area). Each bullet can map to a single pull request. Prioritize Phase 1 tasks before Phase 2, etc.

---

### Phase 1: Core Multi-Account & User Management

#### 1.1. Schema Migrations

1. **Create `accounts` table**  
   - Columns: `id UUID PK`, `name VARCHAR`, `billing_status ENUM`, `billing_plan ENUM`, `billing_customer_id VARCHAR`, `next_billing_date TIMESTAMP`, `created_at TIMESTAMP`, `updated_at TIMESTAMP`.

2. **Create `users` table**  
   - Columns: `id UUID PK`, `email VARCHAR UNIQUE`, `name VARCHAR`, `hashed_password VARCHAR (nullable)`, `status ENUM`, `invited_at TIMESTAMP`, `last_login_at TIMESTAMP`, `created_at`, `updated_at`.

3. **Create `user_accounts` join table**  
   - Columns: `user_id UUID FK → users.id`, `account_id UUID FK → accounts.id`, `role ENUM`, `is_active BOOLEAN DEFAULT true`, `created_at`, `updated_at`.  
   - Composite primary key `(user_id, account_id)`.

4. **Create `invites` table**  
   - Columns: `id UUID PK`, `invited_email VARCHAR`, `account_id UUID FK`, `invited_by UUID FK`, `token VARCHAR UNIQUE`, `expires_at TIMESTAMP`, `accepted_at TIMESTAMP (nullable)`, `created_at TIMESTAMP`.

5. **Create `audit_logs` table**  
   - Columns: `id UUID PK`, `account_id UUID FK`, `user_id UUID FK (nullable)`, `event_type VARCHAR`, `metadata JSONB`, `created_at TIMESTAMP`.

6. **Create `feature_flags` table**  
   - Columns: `id UUID PK`, `flag_key VARCHAR UNIQUE`, `description TEXT`, `is_enabled BOOLEAN`, `created_at`, `updated_at`.  
   - Seed rows:  
     - `ENTERPRISE_PLAN_VISIBLE: false`  
     - `BETA_FEATURE_X: false`  

7. **Create `form_views` table** (to track `FORM_VIEWED`)  
   - Columns: `id UUID PK`, `form_id UUID FK → form_raw_data.id`, `viewed_at TIMESTAMP`, `visitor_id VARCHAR NULL`, `ip_address VARCHAR NULL`.  
   - Index on `(form_id, viewed_at)` for fast lookups.

#### 1.2. NextAuth & Session Customization

1. **Extend NextAuth callbacks**  
   - After successful signin, query `user_accounts` for that user:  
     ```ts
     const accounts = await db('user_accounts').where({ user_id: user.id, is_active: true });
     session.user.accountIds = accounts.map((ua) => ua.account_id);
     if (accounts.length === 1) {
       session.user.activeAccountId = accounts[0].account_id;
       session.user.role = accounts[0].role;
     } else {
       session.user.activeAccountId = null; // force frontend to show /admin/select-account
       session.user.role = null;
     }
     ```

2. **Build `/admin/select-account.tsx` page**  
   - If `session.user.accountIds.length > 1` and `session.user.activeAccountId == null`, redirect here.  
   - Show a list (via SWR) of `{ accountId, name }` pairs. On selection, call `POST /api/auth/switch-account`.

3. **Implement `POST /api/auth/switch-account` handler**  
   - Validate that requested `accountId` is in `session.user.accountIds`.  
   - Query `user_accounts` to get the `role`.  
   - Update session:  
     ```ts
     session.user.activeAccountId = accountId;
     session.user.role = fetchedRole;
     ```
   - Return updated session JSON.

4. **Middleware to protect `/admin/*` routes**  
   - In `pages/admin/_middleware.ts` (or equivalent in App Router):  
     ```ts
     import { getSession } from 'next-auth/react';

     export default async function middleware(req, ev) {
       const session = await getSession({ req });
       if (!session || session.user.status !== 'ACTIVE') {
         return NextResponse.redirect('/login');
       }
       if (!session.user.activeAccountId) {
         return NextResponse.redirect('/admin/select-account');
       }
       if (session.user.role !== 'ADMIN') {
         return NextResponse.redirect('/not-authorized');
       }
       return NextResponse.next();
     }
     ```
   - This ensures only `ADMIN` with an `activeAccountId` can reach any `/admin/*` page.

#### 1.3. Invitation Flow

1. **POST `/api/admin/users/invite`**  
   - Validate `session.user.role === 'ADMIN'`.  
   - Generate `token = uuidv4()`, `expires_at = now() + '7 days'`.  
   - Upsert into `users` table:  
     - If `users.email` doesn’t exist, insert new row with `status = PENDING_INVITE`, `invited_at = now()`.  
     - If exists and `status === 'PENDING_INVITE'`, do nothing to `users`.  
   - Insert into `invites` table with `(invited_email, account_id, invited_by, token, expires_at)`.  
   - Upsert into `user_accounts`: `(user_id, account_id, role, is_active = false)`.  
   - Send magic-link email containing `https://<your-domain>/api/auth/invite/accept?token=${token}`.  
   - Insert into `audit_logs`:  
     ```sql
     INSERT INTO audit_logs (account_id, user_id, event_type, metadata, created_at)
     VALUES (
       session.user.activeAccountId,
       session.user.id,
       'USER_INVITED',
       '{"invitedEmail":"<email>", "role":"<role>"}',
       NOW()
     );
     ```

2. **GET `/api/auth/invite/accept?token=…`**  
   - Lookup `invites` by `token`. If none or expired, return “Invalid or expired token.”  
   - If valid, retrieve `account_id` and `invited_email`.  
   - Fetch or insert corresponding `users` row:  
     - If `users.email = invited_email` already exists with `status = PENDING_INVITE`, update `status = ACTIVE`, `invited_at = NULL`.  
     - Else insert new `users` with `email = invited_email`, `status = ACTIVE`, and prompt user to set `name` + `password`.  
   - Update `invites.accepted_at = now()`.  
   - Update `user_accounts.is_active = true` for `(user_id, account_id)`.  
   - Create a NextAuth session with:  
     ```js
     session.user.accountIds = [account_id, ...other accounts if applicable];
     session.user.activeAccountId = account_id;
     session.user.role = <role from user_accounts>;
     session.user.status = 'ACTIVE';
     ```
   - Redirect to `/admin/dashboard`.

3. **Cleanup Job for Expired Invites**  
   - Create a simple cron (once per day) that deletes or archives invites where `expires_at < now()` and `accepted_at IS NULL`.  
   - Optionally send “Your invite expired” emails if needed.

#### 1.4. User Management Endpoints & UI

1. **GET `/api/admin/users`**  
   - Query:
     ```sql
     SELECT u.id, u.email, u.name, ua.role, u.status, u.invited_at, u.last_login_at
     FROM users u
     JOIN user_accounts ua ON ua.user_id = u.id
     WHERE ua.account_id = session.user.activeAccountId;
     ```
   - Return as JSON to front end.

2. **PUT `/api/admin/users/:userId/role`**  
   - Body: `{ role: "ADMIN"|"DEVELOPER"|"VIEWER" }`  
   - Validate that `:userId` exists in `user_accounts` for this `accountId`.  
   - Update `user_accounts SET role = newRole, is_active = true WHERE user_id = :userId AND account_id = session.user.activeAccountId`.  
   - Insert into `audit_logs`:  
     ```sql
     INSERT INTO audit_logs (account_id, user_id, event_type, metadata, created_at)
     VALUES (
       session.user.activeAccountId,
       session.user.id,
       'USER_ROLE_CHANGED',
       '{"userId":"<:userId>","oldRole":"<oldRole>","newRole":"<newRole>"}',
       NOW()
     );
     ```

3. **DELETE `/api/admin/users/:userId`**  
   - Set `user_accounts.is_active = false` for that `(userId, accountId)`.  
   - Insert into `audit_logs`:  
     ```sql
     INSERT INTO audit_logs (account_id, user_id, event_type, metadata, created_at)
     VALUES (
       session.user.activeAccountId,
       session.user.id,
       'USER_DEACTIVATED',
       '{"userId":"<:userId>"}',
       NOW()
     );
     ```

4. **UI (`/admin/users/index.tsx`)**  
   - SWR-fetch `/api/admin/users`.  
   - Render table with columns: Email, Name, Role (dropdown to change), Status, Invited At, Last Login, Actions (Deactivate).  
   - “Invite New User” form: email + role → POST `/api/admin/users/invite`. On success, clear fields and SWR.mutate.  
   - Changing role: call `PUT /api/admin/users/:id/role` and then SWR.mutate.  
   - Deactivate: call `DELETE /api/admin/users/:id`, then SWR.mutate.

5. **Account Ownership Transfer Endpoint**  
   - **POST** `/api/admin/users/:userId/transfer-ownership`  
     - Body: `{ newAdminUserId: UUID }`  
     - Validation:  
       1. Confirm `session.user.id === :userId` AND `session.user.role === 'ADMIN'`.  
       2. Confirm `newAdminUserId` exists in `user_accounts` for same `accountId` and `is_active = true`.  
     - Update:  
       ```sql
       -- Demote current owner to DEVELOPER (or remove from this account)
       UPDATE user_accounts
       SET role = 'DEVELOPER'
       WHERE user_id = :userId AND account_id = session.user.activeAccountId;

       -- Promote new owner
       UPDATE user_accounts
       SET role = 'ADMIN'
       WHERE user_id = newAdminUserId AND account_id = session.user.activeAccountId;
       ```
     - Insert audit log:  
       ```sql
       INSERT INTO audit_logs (account_id, user_id, event_type, metadata, created_at)
       VALUES (
         session.user.activeAccountId,
         session.user.id,
         'OWNERSHIP_TRANSFERRED',
         '{"oldOwner":"<:userId>","newOwner":"<newAdminUserId>"}',
         NOW()
       );
       ```
     - Return 200.

---

### Phase 2: Billing Abstraction & Provider Integration

#### 2.1. Schema Migrations

1. **Alter `accounts` table**  
   - Add columns:  
     - `provider VARCHAR`  
     - `subscription_id VARCHAR`  
     - `billing_plan ENUM('FREE','PRO','ENTERPRISE')`  
     - `billing_status ENUM('ACTIVE','PAST_DUE','CANCELED')`  
     - `billing_customer_id VARCHAR`  
     - `next_billing_date TIMESTAMP`  

2. **Create `invoices` table**  
   - Columns: `id UUID PK`, `account_id UUID FK`, `provider VARCHAR`, `provider_invoice_id VARCHAR`, `amount_due INT`, `amount_paid INT`, `currency VARCHAR`, `status ENUM('PAID','OPEN','PAST_DUE','VOIDED')`, `invoice_date TIMESTAMP`, `due_date TIMESTAMP`, `pdf_blob BYTEA`, `created_at TIMESTAMP`, `updated_at TIMESTAMP`.

#### 2.2. Provider Service Layer

1. **Implement `services/billing.ts`**  
   - Functions:  
     - `createProviderCustomer(provider, accountName, email)`: Branch on `'stripe'`, `'paypal'`, `'zelle'`, `'razorpay'`, etc.  
     - `changeProviderPlan(provider, customerId, subscriptionId, newPlanKey)`: Branch similarly.  
     - `getProviderInvoices(provider, customerId)`: For Stripe, call `stripe.invoices.list({ customer: customerId })`; for PayPal, call the PayPal Invoices API; for Zelle, read from local `invoices`.  
     - `downloadInvoicePdf(provider, invoiceId)`: For Stripe, call `stripe.invoices.retrieve({ id }).invoice_pdf`, then store in `invoices.pdf_blob`. For PayPal, call PayPal’s PDF endpoint. For Zelle, return local `pdf_blob`.  

2. **Unit tests for `services/billing.ts`**  
   - Mock Stripe client and ensure correct parameters passed.  
   - For Zelle, test that “manual” status is returned.

#### 2.3. Stripe (and Other) Webhooks

1. **Implement `/api/stripe/webhook`**  
   - Disable body parser (`export const config = { api: { bodyParser: false } };`).  
   - Verify `stripe-signature`.  
   - Handle events:  
     - `invoice.paid`:  
       - Upsert into `invoices`:
         ```sql
         INSERT INTO invoices (id, account_id, provider, provider_invoice_id, amount_due, amount_paid, currency, status, invoice_date, due_date, pdf_blob, created_at, updated_at)
         VALUES (uuid_generate_v4(), <account_id>, 'stripe', <stripe_invoice_id>, <amount_due>, <amount_paid>, <currency>, 'PAID', <invoice_date>, <due_date>, <binary_pdf>, NOW(), NOW())
         ON CONFLICT (provider_invoice_id) DO UPDATE SET status='PAID', amount_paid=<amount_paid>, updated_at=NOW();
         ```
       - Update `accounts.billing_status = 'ACTIVE'` and `accounts.next_billing_date` if needed.  
       - Insert audit log:
         ```sql
         INSERT INTO audit_logs (account_id, user_id, event_type, metadata, created_at)
         VALUES (<account_id>, NULL, 'INVOICE_PAID', '{"invoiceId":"<stripe_invoice_id>","amountPaid":<amount_paid>}', NOW());
         ```
     - `invoice.payment_failed`:  
       - Update `invoices.status = 'PAST_DUE'`, `accounts.billing_status = 'PAST_DUE'`.  
       - Insert audit log:
         ```sql
         INSERT INTO audit_logs (account_id, user_id, event_type, metadata, created_at)
         VALUES (<account_id>, NULL, 'PAYMENT_FAILED', '{"invoiceId":"<stripe_invoice_id>"}', NOW());
         ```
     - `customer.subscription.updated`:  
       - Update `accounts.billing_plan` and `accounts.next_billing_date = subscription.current_period_end * 1000` (convert UNIX).  
       - Insert audit log:
         ```sql
         INSERT INTO audit_logs (account_id, user_id, event_type, metadata, created_at)
         VALUES (<account_id>, NULL, 'PLAN_CHANGED', '{"newPlan":"<new_plan>"}', NOW());
         ```

2. **Implement `/api/paypal/webhook`** (similar structure)  
   - Verify PayPal signature.  
   - Map PayPal events (e.g. `BILLING.SUBSCRIPTION.ACTIVATED`, `PAYMENT.SALE.COMPLETED`) to our `invoices` or `accounts` updates.

3. **Zelle Handling**  
   - Since Zelle has no webhook, we’ll rely on a manual “Mark invoice paid” UI in `/admin/invoices`. Admin can click “Mark as Paid”, which calls an endpoint (e.g. `POST /api/admin/invoices/:id/mark-paid`). That endpoint updates `invoices.status = 'PAID'` and `accounts.billing_status = 'ACTIVE'`. Insert audit log accordingly.

#### 2.4. Billing API Endpoints & UI

1. **GET `/api/admin/billing`**  
   - Query `accounts` for `account_id = session.user.activeAccountId`.  
   - Return `{ billingPlan, billingStatus, nextBillingDate, provider, usage: {...}, availableProviders: ['stripe','paypal','zelle','razorpay'] }`.

2. **POST `/api/admin/billing/change-plan`**  
   - Body: `{ newPlan: "FREE"|"PRO"|"ENTERPRISE" }`.  
   - Fetch `accounts.provider`, `billing_customer_id`, and `subscription_id`.  
   - Call `changeProviderPlan(provider, billing_customer_id, subscription_id, newPlan)`.  
   - Update `accounts.billing_plan` = `newPlan`.  
   - Insert audit log:
     ```sql
     INSERT INTO audit_logs (account_id, user_id, event_type, metadata, created_at)
     VALUES (
       session.user.activeAccountId,
       session.user.id,
       'PLAN_CHANGED',
       '{"oldPlan":"<oldPlan>","newPlan":"<newPlan>","provider":"<provider>"}',
       NOW()
     );
     ```

3. **POST `/api/admin/billing/update-card`**  
   - Fetch `accounts.provider` & `billing_customer_id`.  
   - If `stripe`, call `stripe.billingPortal.sessions.create({ customer, return_url })` and return `{ url }`.  
   - If `paypal`, call PayPal’s “Manage billing” API.  
   - If `zelle`, return `{ message: "Manual - send payment via Zelle to xyz@bank" }`.

4. **GET `/api/admin/invoices`**  
   - Query `invoices` table:
     ```sql
     SELECT id, provider_invoice_id, amount_due, amount_paid, currency, status, invoice_date, due_date
     FROM invoices
     WHERE account_id = session.user.activeAccountId
     ORDER BY invoice_date DESC
     LIMIT :limit OFFSET (:page - 1) * :limit;
     ```
   - Return as JSON.

5. **GET `/api/admin/invoices/:invoiceId/pdf`**  
   - Validate invoice belongs to `session.user.activeAccountId`.  
   - Stream `res.setHeader('Content-Type', 'application/pdf'); res.send(pdf_blob);`.

6. **POST `/api/admin/billing/provider`**  
   - Body: `{ provider: "stripe"|"paypal"|"zelle"|"razorpay" }`.  
   - Update `accounts.provider` = new value.  
   - If changing *from* Stripe → call `stripe.subscriptions.del(subscription_id)` or set `billing_status = 'CANCELED'`.  
   - Insert audit log.

7. **UI Pages**  
   - `/admin/billing/index.tsx`: SWR-fetch `/api/admin/billing`. Render plan/status, dropdown for `availableProviders` + `billingPlan` (controlled by feature flags), “Update Payment Method” button.  
   - `/admin/billing/invoices.tsx`: SWR-fetch `/api/admin/invoices`. Render table with “Download PDF” and, for Zelle invoices, “Mark as Paid” button.  
   - “Mark as Paid” calls `POST /api/admin/invoices/:id/mark-paid`: update `invoices.status = 'PAID'`, `accounts.billing_status = 'ACTIVE'`, insert audit log.

---

### Phase 3: Form-Related Audit, `FORM_VIEWED`, Follow-Up Emails & Feature Flags

#### 3.1. Form-Related Audit

1. **Update existing form DAO/handlers** (e.g. in `backend-services/src/routes/forms.ts`):  
   - After `POST /forms` (create), insert into `audit_logs` with `event_type = 'FORM_CREATED'`, `metadata = { before: null, after: <newForm> }`.  
   - After `PUT /forms/:formId` (update), fetch old record, then insert into `audit_logs` with `event_type = 'FORM_UPDATED'`, `metadata = { before: <oldForm>, after: <newForm> }`.  
   - After publishing (if there’s a separate `publish` route), insert `event_type = 'FORM_PUBLISHED'`, `metadata = { formId, oldStatus: 'DRAFT', newStatus: 'PUBLISHED' }`.  
   - After delete, insert `event_type = 'FORM_DELETED'`, `metadata = { before: <oldForm>, after: null }`.  
   - After settings change, insert `event_type = 'FORM_SETTINGS_CHANGED'`, with before/after.

2. **Create `/api/admin/forms/views` endpoint (optional)**  
   - If you want admins to query “which users viewed which forms when,” create a protected endpoint that returns aggregated `form_views` data.

#### 3.2. `FORM_VIEWED` Tracking & Follow-Up Emails

1. **Augment public form-rendering code** (e.g. in the page that serves `/forms/:slug` or whatever):  
   - When a form is loaded by an end user, insert a row into `form_views` with `form_id`, `viewed_at = now()`, plus optional `visitor_id` (if you set a cookie) and `ip_address`.  
   - Also insert into `audit_logs` (if desired):
     ```sql
     INSERT INTO audit_logs (account_id, user_id, event_type, metadata, created_at)
     VALUES (<account_id>, NULL, 'FORM_VIEWED', '{"formId":"<form_id>"}', NOW());
     ```

2. **New table `form_views`**  
   - Columns: `id UUID PK`, `form_id UUID FK → forms.id`, `viewed_at TIMESTAMP`, `visitor_id VARCHAR (nullable)`, `ip_address VARCHAR (nullable)`.  
   - Index: `CREATE INDEX idx_form_views_form ON form_views(form_id, viewed_at);`

3. **Follow-Up Email Worker**  
   - Build a scheduled job (e.g. a cron function that runs once per day at 2 AM). Steps:  
     1. Query all `form_views` in the last 24 hours:
        ```sql
        SELECT form_id, COUNT(DISTINCT visitor_id, ip_address) AS viewCount
        FROM form_views
        WHERE viewed_at >= now() - INTERVAL '1 day'
        GROUP BY form_id;
        ```
     2. For each `form_id`, fetch the form’s `author_id`, `end_date`, and user’s contact email.  
     3. If `now() < end_date`, send a follow-up email (e.g. “It looks like you viewed Form X. Would you like to complete it before <end_date>?”).  
     4. Insert audit log entry for each email sent:
        ```sql
        INSERT INTO audit_logs (account_id, user_id, event_type, metadata, created_at)
        VALUES (<account_id>, <author_id>, 'FOLLOWUP_EMAIL_SENT', '{"formId":"<form_id>","sentAt":"<now>"}', NOW());
        ```
   - Use a library like node-cron or Next.js’ built-in scheduled functions.

4. **Email Templates & Settings**  
   - Store email subject/body templates in a config file or DB table (`email_templates`).  
   - Provide an Admin UI (optional) to customize follow-up content per form or globally.

#### 3.3. Feature Flags Management

1. **GET `/api/admin/feature-flags`**  
   - Return all rows from `feature_flags`.

2. **PUT `/api/admin/feature-flags/:flagKey`**  
   - Body: `{ is_enabled: true | false }` → Update the row.  
   - Insert audit log:
     ```sql
     INSERT INTO audit_logs (account_id, user_id, event_type, metadata, created_at)
     VALUES (
       session.user.activeAccountId,
       session.user.id,
       'FEATURE_FLAG_TOGGLED',
       '{"flagKey":"<flagKey>","newValue":<is_enabled>}',
       NOW()
     );
     ```

3. **UI: `/admin/settings/feature-flags.tsx`**  
   - SWR-fetch `/api/admin/feature-flags`. Render a list with toggles for each `flag_key`.  
   - On toggle, call `PUT /api/admin/feature-flags/:flagKey` and SWR.mutate.

4. **Conditional Rendering in Other Pages**  
   - Wrap “Enterprise” option in billing dropdown with:
     ```tsx
     {featureFlags['ENTERPRISE_PLAN_VISIBLE'] && <option value="ENTERPRISE">Enterprise</option>}
     ```
   - For other restricted features, check both `featureFlags['FEATURE_X']` and `session.user.role` or `session.account.billing_plan`. Show “Upgrade to use” banner if not allowed.

5. **Future: Per-Account Flags**  
   - Later, if you need to enable a flag only for account ABC, add column `account_id` in `feature_flags` and update GET endpoint to filter `WHERE account_id = session.user.activeAccountId OR account_id IS NULL` (for global).  
   - UI can then toggle per account.

#### 3.4. Account Settings Page

1. **GET `/api/admin/account`** (already defined)  
   - Include `name`, `billingPlan`, `billingStatus`, `nextBillingDate`, `usageStats`, `featureFlags`.

2. **PUT `/api/admin/account`** (already defined)  
   - Body can include `name`, `address`, `contactEmail`, `logoUrl`, `taxId`, and any new “billing_settings” fields.

3. **UI: `/admin/settings/index.tsx`**  
   - SWR-fetch `/api/admin/account`. Render form fields for `name`, `address`, `contactEmail`, `logoUrl` (with file upload).  
   - On submit, call `PUT /api/admin/account` with the updated JSON. On success, SWR.mutate.

---

### Phase 4: Final Polish, Testing, and Release

1. **End-to-End Tests**  
   - Sign-up/invitation flows with multiple accounts.  
   - Ownership transfer: ensure old Admin is demoted.  
   - Form-view tracking: manually load a published form, verify one `form_views` row, verify follow-up email enqueued.  
   - Billing with multiple providers: Stripe in test mode, manual Zelle, PayPal sandbox, Razorpay sandbox.  
   - Invoice PDF upload/stream, schema changes, and migration path (optional S3).

2. **RBAC Verification**  
   - Ensure only `role === 'ADMIN'` can hit `/api/admin/*`.  
   - If a Developer tries to access billing endpoints or user management, they get 403.  
   - Verify session switching updates `session.user.role`.

3. **Responsive UI & Accessibility**  
   - Sidebar collapses on mobile.  
   - Account switcher always visible.  
   - Tables have proper `aria-` labels.

4. **Feature Flag Launch**  
   - Toggle `ENTERPRISE_PLAN_VISIBLE = true`.  
   - Attempt to select Enterprise plan in billing UI.  
   - If user’s plan < PRO, show “Upgrade required” message.

5. **Documentation**  
   - Add detailed API docs (Swagger or Postman collection).  
   - README with setup instructions: environment variables (Stripe keys, PayPal keys, Razorpay keys, etc.), migration commands, how to seed initial feature flags.

---

## 4. Next Questions or Clarifications

1. **Form Views & Follow-Up Email Cadence**  
   - Should follow-up emails be sent only once per unique visitor, or every time they view? (Typically once.)  
   - Should the email logic live entirely in a CRON job, or do you want to enqueue a one-off “send at end date” job when a form is first published?  
   - Do you need template customization per form, or is a single “generic reminder” template acceptable?

2. **Account Ownership Transfer Edge Cases**  
   - If an Admin transfers ownership but remains active as DEVELOPER, can they transfer again? Or should we force only the current “owner” role to transfer?  
   - Should we allow multiple “owners” (multiple `role='ADMIN'`) on the same account? (Currently yes, since `user_accounts.role` is not a singleton. As long as you mark one as ADMIN, you can transfer.)

3. **Invoice Retention Policy**  
   - After how many years should we archive or delete old invoices?  
   - Do we need to maintain a journal table for deleted invoices once the file storage move happens?

4. **Multi-Currency Requirements**  
   - Will Razorpay/UPI invoices always be in INR? Or do you want to display currency conversion for users in USD/EUR?  
   - Do you need a “currency” field on the `accounts` table to show invoice amounts in the user’s preferred currency?

5. **Feature Flag Ownership**  
   - Who will manage feature flags? Only the development team, or will customer support/admins in the UI toggle them for specific customers?  
   - If “higher-paid customers only” features exist, do you want a new column on `feature_flags` called `minPlanRequired` (e.g. `PRO` or `ENTERPRISE`) so that even if `is_enabled=true`, only accounts at or above that tier see it?

Once these are answered, we’ll have full clarity down to the smallest detail. Let me know if any of the above needs further explanation or adjustment!


---

## Consolidated Follow-Up Questions / Clarifications

1. **Form Views & Follow-Up Email Cadence**  
   - Should follow-up emails be sent only once per unique visitor, or every time they view? (Typically once.)  ------ one per end-user linked or associated to the form by the the form creator/admin. Note that, creator or admin may be able to create distribution groups (which may contain all the end customers related to the org or business). 
   - Should the email logic live entirely in a CRON job, or do you want to enqueue a one-off “send at end date” job when a form is first published?  ------ I would prefer the functionality should cater, to re-send or re-notification of the emails are entierly at forms owners discretion, meaning user will flag in the forms settings during the design time. This will be per form base.
   - Do you need template customization per form, or is a single “generic reminder” template acceptable?  ------- per form customization, but the template associated for perform will be standard across all the forms. some forms may not be opted by the admin or owner for resend of emails.

2. **Account Ownership Transfer Edge Cases**  
   - If an Admin transfers ownership but remains active as DEVELOPER, can they transfer again? Or should we force only the current “owner” role to transfer?  ------ a user, with in the org or business, can degrade the role from admin to developer and upgrade from develoepr to admin. but this task must be done by the admin role or the primary owner of the entire account. 
   - Should we allow multiple “owners” (multiple `role='ADMIN'`) on the same account? (Currently yes, since `user_accounts.role` is not a singleton. As long as you mark one as ADMIN, you can transfer.) ------ in general, at org level you can have more than one admin but only one owner role. pls correct me if I'm wrong.

3. **Invoice Retention Policy**  
   - After how many years should we archive or delete old invoices?  ------ what is the industry standard? will follow the same.
   - Do we need to maintain a journal table for deleted invoices once the file storage move happens? ----- it may be required for audit purpose correct?

4. **Multi-Currency Requirements**  
   - Will Razorpay/UPI invoices always be in INR? Or do you want to display currency conversion for users in USD/EUR?  ----- lets start with UPI/Razorpay and also display currency conversion too.
   - Do you need a “currency” field on the `accounts` table to show invoice amounts in the user’s preferred currency?  ---- yes

5. **Feature Flag Ownership**  
   - Who will manage feature flags? Only the development team, or will customer support/admins in the UI toggle them for specific customers?  ----- customer support/admins will manage
   - If “higher-paid customers only” features exist, do you want a new column on `feature_flags` called `minPlanRequired` (e.g. `PRO` or `ENTERPRISE`) so that even if `is_enabled=true`, only accounts at or above that tier see it?   ------ if this is preferred, go with it

Please ask any questions or clarifications to build a strong architecture and development phases in more granular level.