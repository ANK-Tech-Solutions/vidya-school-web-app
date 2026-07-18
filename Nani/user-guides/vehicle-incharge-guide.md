# Vehicle incharge guide

The **Vehicle Incharge** is a school's fleet operations manager. You oversee buses, routes, assignments, and
live tracking — but you don't enroll students or manage academics.

Portal: `/incharge` · Sign in as `vehicle1` / `Password@123`.

Your account is created by your **school admin** under **Admin → Vehicle incharges**.

## Your sections

| Section | Route | Purpose |
| --- | --- | --- |
| Overview | `/incharge` | Fleet snapshot |
| Buses | `/incharge/buses` | Vehicle list & status |
| Routes | `/incharge/routes` | Routes and stops |
| Drivers | `/incharge/drivers` | Drivers and their assignments |
| Assignments | `/incharge/assignments` | Driver–bus / student–bus mapping |
| Tracking | `/incharge/tracking` | Live map + route track panel |
| Trip Replay | `/incharge/replay` | Play back a past trip's GPS trail |
| Reports | `/incharge/reports` | Operational reports |

## Example — Watch a live trip with full route detail

1. Go to **Tracking**.
2. Select a driver/bus that has an active trip.
3. The map shows:
   - the **route polyline** and every **stop** as a marker,
   - the **bus** moving in real time,
   - highlights for the **current** and **next** stop.
4. The side **route track panel** lists all stops with status and **ETA** to the next stop.

## Example — Replay a completed trip

1. Go to **Trip Replay**.
2. Pick a trip from the dropdown (most recent first).
3. The map draws the actual **GPS breadcrumb** (blue) over the planned route stops (dashed). Use **Play**,
   the **slider**, and **Reset** to scrub through the journey and see where/when the bus was.

## Example — Reassign a bus

1. Go to **Assignments → Driver–bus**.
2. End the current assignment (set it inactive) and create a new one for the replacement driver.
3. The new driver immediately sees the bus/route in their driver portal.

## Tips

- If a bus needs servicing, set its status to `MAINTENANCE` under **Buses** so it's excluded from active use.
- Stops are ordered by `stop_order`; keep ETAs realistic so parents get accurate arrival estimates.
