# Driver guide

The **Driver** portal runs your trips and shares your live GPS so parents and staff can track the bus.

Portal: `/driver` · Sign in as `driver1` / `Password@123`.

> Best experience: open on your phone and **Add to Home Screen** to run it full screen.

## Your sections

| Section | Route | Purpose |
| --- | --- | --- |
| Dashboard | `/driver` | Trip controls + location toggle |
| Trip | `/driver/trip` | Active trip screen |
| Route | `/driver/route` | Your assigned route and stops |
| Students | `/driver/students` | Today's student manifest |
| History | `/driver/history` | Past trips |
| Profile | `/driver/profile` | Your account |

## Example — Run a morning trip

1. Open **Dashboard**.
2. Tap **Start trip**. If location isn't on yet, you'll be asked to enable it.
3. **Allow location** when the browser prompts. A message confirms location stays on while you switch screens
   or minimize the app.
4. Drive your route — your position streams live to parents and staff automatically.
5. At the end, tap **End trip**.
6. Tap **Disable location** when you're done sharing.

## Background location — how it works

- Once enabled, GPS keeps running even if you switch screens or minimize the app (a screen **wake lock** helps
  keep it alive).
- If you briefly lose signal, fixes are queued and sent when you reconnect.
- It only stops when you tap **Disable location**.

## Emergency (SOS)

- Tap **SOS** to raise an emergency alert for your trip. Staff are notified immediately.

## Troubleshooting location

| Message | What to do |
| --- | --- |
| "Location permission is blocked" | Enable location for the site in your browser settings, then retry. |
| "Location requires HTTPS" | Open the app over `https://` (production URL), not plain `http`. |
| Location won't turn on | Ensure device location services are on and you granted permission. |

## Manifest & boarding check-in

**Students** shows who to pick up/drop today based on the student–bus assignments, including each student's stop.

- Tap **Board** as each student gets on — this notifies their parent (`STUDENT_PICKED`) and records a bus boarding.
- Tap **Absent** if they're not coming.
- If you don't check a student in and you drive past their stop, the system sends the parent an automatic
  **no-show** alert. (Start a trip first — check-in needs an active trip.)

> Boarding check-in is a **bus record only** — it is not classroom attendance. Class attendance is marked by
> teachers in the teacher portal, and that is what students/parents see as their attendance.

### Scan to board (QR / NFC / RFID / face / fingerprint)

Tap **Scan to board** to open the scanner. Pick a method, then present the student's ID:

- **QR code** — scan the ID card QR with the phone camera (Chromium/Android) or a handheld scanner. On a
  successful read the student is boarded, a **"<name> marked boarded"** confirmation appears next to the camera
  button, and the camera stops. Start it again for the next student.
- **NFC / RFID** — tap the student's card (Web NFC on Chrome for Android), or use a tap reader.
- **Face** — point the camera at the student's face; they board **automatically once recognised** against their
  enrolled photo. Requires each student to have a photo on file (reachable by the browser); if none are enrolled
  the scanner tells you so. Face models are served from `/public/models` (bundled, no external calls).
- **Fingerprint** — use a fingerprint terminal that outputs the matched student's code into the box.
- **Manual** — type or paste the student code / QR value / tag.

Any hardware scanner that "types" the scanned value into the focused box also works. The system matches the code
against the student's QR value, RFID/NFC tag, or student code and boards them, recording the method used. Every
successful board shows the **marked** confirmation chip beside the camera controls.

Parents also get an automatic **"bus arriving"** alert the moment your bus enters their stop's geofence.
