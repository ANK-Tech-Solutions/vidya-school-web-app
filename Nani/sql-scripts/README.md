# SQL scripts

These scripts target **MySQL 8**. The authoritative schema lives in the Flyway migrations at
`school-management-backend/src/main/resources/db/migration` and runs automatically on backend startup — you
normally do **not** run schema SQL by hand. These files are for reference, demos, and operations.

| File | Purpose | Safe to run repeatedly? |
| --- | --- | --- |
| `01_schema_reference.sql` | Pointer + notes about the Flyway-managed schema | n/a (reference) |
| `02_seed_demo_data.sql` | Reference copy of the demo seed (roles, school, users) | Idempotent guards included |
| `03_provisioning_examples.sql` | Create a school, admin, incharge, driver, bus, route+stops, assignments | Yes (uses `INSERT ... SELECT ... WHERE NOT EXISTS`) |
| `04_common_queries.sql` | Read-only operational queries | Yes (SELECT only) |
| `05_maintenance.sql` | Reset passwords, deactivate users, clean tokens | Review before running (mutating) |

> All demo passwords are BCrypt hashes of `Password@123`. New users created by the app default to the same
> password when none is supplied.

**Keep these in sync** whenever a migration changes the schema (see the maintenance contract in
[`../README.md`](../README.md)).
