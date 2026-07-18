# Admin guide

The **School Admin** runs one school. Everything you see and do is automatically scoped to your school.

Portal: `/admin` · Sign in as `admin` / `Password@123`.

## Your sections

| Section | Route | Purpose |
| --- | --- | --- |
| Overview | `/admin` | Dashboard stats (students, buses, trips, alerts) |
| Analytics | `/admin/analytics` | On-time %, fleet utilisation, fees, exam average, 7-day attendance trend |
| Students | `/admin/students` | Enroll and manage students |
| Parents | `/admin/parents` | Manage parent/guardian accounts |
| Teachers | `/admin/teachers` | Manage teaching staff |
| Vehicle incharges | `/admin/vehicle-incharges` | Create fleet managers for `/incharge` |
| Tracking | `/admin/tracking` | Live fleet map |
| Notifications | `/admin/notifications` | Broadcasts and alerts |
| Reports | `/admin/reports` | Trip/attendance/summary reports |
| Audit Log | `/admin/audit-log` | Searchable record of every create/update/delete across admin, platform, and fleet |
| Settings | `/admin/settings` | School branding & preferences |

> **Fleet lives with the Vehicle Incharge.** Buses, routes, drivers, and driver/student **assignments** are
> managed in the `/incharge` portal, not by the admin. As admin you create the vehicle incharge, who then owns
> the fleet. (The backend explicitly denies admin access to fleet endpoints.)

## Example 1 — Onboard the fleet (via your vehicle incharge)

1. Create a **vehicle incharge** (see Example 3 below) and share their login.
2. They sign in at `/incharge` and add **buses**, **routes** (with ordered **stops**), and **drivers**.
3. They create **Driver–bus** and **Student–bus** assignments, which power the driver's trip controls,
   the manifest, and parent tracking.

## Example 2 — Enroll a student

1. Go to **Students → Add student**.
2. Enter student code, name, grade/section, and pickup details.
3. Save. The vehicle incharge can then assign the student to a bus and stop.

## Example 3 — Add a vehicle incharge (fleet manager)

1. Go to **Vehicle incharges → Add**.
2. Enter username, email, name, phone (password defaults to `Password@123` if blank).
3. Save. They sign in at `/incharge` to oversee buses, routes, assignments, and live tracking for your school.

> Vehicle incharge management moved here from the platform portal so each school owns its own fleet managers.

## Example 4 — Send a notification

1. Go to **Notifications**.
2. Compose a title + body, choose the audience, and send. It appears in recipients' in-app notifications
   (and via push if Firebase is enabled).

## Example 5 — Read the analytics dashboard

1. Open **Analytics**. KPI tiles show students, teachers, active buses, drivers online, on-time %, trips
   completed, students transported (last 30 days), and the school-wide exam average.
2. The **attendance trend** chart shows present/late (teal) vs absent (amber) for the last 7 days.
3. The **fees** panel shows invoiced vs collected vs outstanding with a collection progress bar.

## Example 6 — Investigate with the audit log

1. Open **Audit Log**. Each row shows when, which user, the action (`METHOD /path`), the area, and the IP.
2. Filter by action (e.g. `DELETE` or `/students`) to narrow down. Page through with Previous/Next.

## Tips

- Deactivating a student/teacher/incharge disables login but keeps history.
- Reports can be filtered by date range and exported for record-keeping.
- Overspeed alerts (bus over 60 km/h) arrive as admin notifications automatically during live trips.
