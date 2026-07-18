# Super admin guide

The **Super Admin** is the platform owner. You provision **schools** and create the first **school admin** for
each one. You do **not** manage day-to-day school data — that's the school admin's job.

Portal: `/platform` · Sign in as `superadmin` / `Password@123`.

## What you can do

- **Schools** (`/platform/schools`): register, edit, and deactivate schools.
- **School admins** (`/platform/admins`): create and deactivate the ADMIN account for a school.

## Example 1 — Register a new school

1. Go to **Platform → Schools**.
2. Click **Add school**.
3. Fill in the form:
   - **Code** (unique, e.g. `GREENWOOD01`)
   - **Name** (e.g. `Greenwood High`)
   - Optional: app name/icon (branding), address, city, state, phone, email, timezone.
4. Save. The school appears in the list as **Active**.

> Empty optional fields are dropped before sending, so you only store what you fill in.

## Example 2 — Create the school's admin

1. Go to **Platform → School admins**.
2. Click **Add admin**.
3. Choose the **school** you just created.
4. Enter username, email, first/last name, phone. Password is optional — if left blank it defaults to
   `Password@123`.
5. Save. Hand the credentials to the school; they sign in at `/admin`.

## Example 3 — Deactivate a school or admin

- On the Schools or School admins list, use **Deactivate**. Deactivated schools/users can no longer sign in,
  but their historical data is preserved.

## Good to know

- Super admin accounts have **no** `school_id` — they sit above all tenants.
- To add fleet managers (vehicle incharges), that's done **inside each school by its admin**, not here.

## Common tasks → API (for reference)

| Task | Endpoint |
| --- | --- |
| List schools | `GET /api/v1/platform/schools` |
| Create school | `POST /api/v1/platform/schools` |
| Update school | `PUT /api/v1/platform/schools/{id}` |
| Deactivate school | `PATCH /api/v1/platform/schools/{id}/deactivate` |
| List / create admins | `GET` / `POST /api/v1/platform/admins` |
| Deactivate admin | `PATCH /api/v1/platform/admins/{id}/deactivate` |
