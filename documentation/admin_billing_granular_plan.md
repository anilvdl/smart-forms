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
