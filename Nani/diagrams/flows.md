# Sequence flows

## 1. Authentication (login + refresh)

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend (Next.js)
  participant API as Spring Boot API
  participant DB as MySQL

  U->>FE: Enter username + password
  FE->>API: POST /api/v1/auth/login
  API->>DB: Verify user + BCrypt password
  DB-->>API: User + roles
  API-->>FE: accessToken (JWT) + refreshToken + user
  FE->>FE: Store tokens, homeRouteForRoles(roles)
  FE-->>U: Redirect to portal home

  Note over FE,API: Later, on 401
  FE->>API: POST /api/v1/auth/refresh { refreshToken }
  API-->>FE: New accessToken
```

## 2. School provisioning (SUPER_ADMIN)

```mermaid
sequenceDiagram
  participant SA as Super Admin
  participant FE as /platform
  participant API as PlatformController
  participant DB as MySQL

  SA->>FE: Create school (code, name, contact, branding)
  FE->>API: POST /api/v1/platform/schools
  API->>DB: INSERT schools
  SA->>FE: Create school admin (pick school, user details)
  FE->>API: POST /api/v1/platform/admins
  API->>DB: INSERT users + user_roles(ADMIN), school_id = chosen school
  API-->>FE: Admin created (default password Password@123)
  Note over SA: Admin now signs in at /admin for that school
```

## 3. Driver trip + background GPS

```mermaid
sequenceDiagram
  participant D as Driver phone
  participant RT as DriverLocationRuntime (singleton)
  participant API as DriverController
  participant DB as MySQL
  participant WS as STOMP broker

  D->>API: POST /api/v1/driver/trip/start
  API->>DB: INSERT trip (IN_PROGRESS)
  D->>RT: Enable location (Geolocation + wake lock)
  loop every few seconds (even minimized)
    RT->>API: POST location {lat,lng,speed,heading}
    API->>DB: UPDATE drivers.last_* + INSERT trip_locations
    API->>WS: publish live position
  end
  D->>API: POST /api/v1/driver/trip/end
  API->>DB: UPDATE trip (COMPLETED)
  D->>RT: Disable location (release wake lock)
```

Notes:
- The runtime persists `enabled` in `localStorage` and queues fixes offline, so GPS survives screen changes,
  minimizing, and brief network drops.
- `enable()` returns an error message string (or `null` on success) so the UI can explain permission/HTTPS issues.

## 4. Live tracking with route stops & ETA (student/parent, incharge, teacher)

```mermaid
sequenceDiagram
  participant V as Viewer (parent/incharge/teacher)
  participant FE as Tracking page
  participant API as Portal API
  participant WS as STOMP broker
  participant DB as MySQL

  V->>FE: Open tracking page
  FE->>API: GET tracking snapshot
  API->>DB: Read active trip + route_stops + last position
  API-->>FE: LiveTrackingResponse (bus, route, stops[], current/next/your stop, ETA)
  FE->>WS: Subscribe to live updates
  loop while trip active
    WS-->>FE: New bus position
    FE->>FE: Move bus marker, recompute progress along stops
  end
  FE-->>V: Map (route polyline + stop markers) + RouteTrackPanel (status + ETA)
```

## 5. Automatic trip events: geofence, overspeed, no-show

```mermaid
sequenceDiagram
  participant D as Driver GPS
  participant API as DriverController
  participant TE as TripEventService
  participant DB as MySQL
  participant N as NotificationService

  D->>API: POST /api/v1/driver/location {lat,lng,speed}
  API->>DB: INSERT trip_locations
  API->>TE: process(trip, fix)
  alt speed >= 60 km/h (5-min cooldown)
    TE->>N: OVERSPEED alert to school admins
  end
  loop each route stop within geofence radius
    TE->>DB: INSERT trip_stop_events(ARRIVED) if new
    TE->>N: BUS_APPROACHING to that stop's parents
    Note over TE: For earlier stops now passed…
    TE->>DB: student boarded? (attendance BOARDING)
    alt not boarded
      TE->>DB: INSERT attendance(ABSENT, GEOFENCE)
      TE->>N: NO_SHOW alert to parent
    end
  end
```

Boarding is captured by the driver on the manifest (`POST /driver/students/{id}/board` → `attendance BOARDING`,
which also fires `STUDENT_PICKED`). Overspeed de-dupe is in-memory per trip (single-instance deployment).

## 6. Trip replay (Vehicle Incharge)

```mermaid
sequenceDiagram
  participant I as Incharge
  participant FE as /incharge/replay
  participant API as InchargeTripController
  participant DB as MySQL

  I->>FE: Pick a past trip
  FE->>API: GET /api/v1/incharge/trips/{id}/replay
  API->>DB: Read trip + ordered trip_locations + route_stops
  API-->>FE: TripReplayResponse (points[], stops[])
  FE->>FE: Play/scrub timeline → move bus marker along breadcrumb polyline
```

Keep these diagrams in sync whenever the corresponding controllers, hooks, or pages change.
