# Architecture (developer)

See also the visual diagrams in [`../diagrams/architecture.md`](../diagrams/architecture.md).

## Backend (`school-management-backend`)

```
src/main/java/com/schoolbus/
├── controller/     # @RestController endpoints under /api/v1
├── service/        # business logic + @Transactional boundaries
├── repository/     # Spring Data JPA repositories
├── entity/         # JPA entities (+ entity.enums)
├── dto/request/    # inbound request records
├── dto/response/   # outbound response records (ApiResponse<T>, PageResponse<T>)
├── util/           # SecurityUtils, helpers
└── config/         # security, web, CORS, OpenAPI
src/main/resources/
├── application.yml, application-prod.yml
└── db/migration/   # Flyway V1..V8
```

### Patterns

- **Uniform envelope:** all endpoints return `ApiResponse<T>` (`success`, `message`, `data`). Lists use
  `PageResponse<T>`.
- **Tenancy:** `SecurityUtils.getCurrentSchoolId()` yields the caller's school; repositories expose
  `findBySchoolId...` / `findByIdAndSchoolId` for scoped access. `SUPER_ADMIN` has `school_id = NULL`.
- **Role-specific controllers:** e.g. `PlatformController` (super admin), `Admin*Controller` (admin),
  `VehicleInchargeController`, `DriverController`, `AcademicController` (teacher), `StudentController`.
- **Endpoint aliases:** `DriverController` accepts both `/trips/*` and `/trip/*` (and `/students` alias for
  `/students/today`) for client compatibility.

## Frontend (`school-management-frontend`)

```
src/
├── app/(auth)/login/          # login
├── app/(dashboard)/<portal>/  # platform, admin, incharge, driver, teacher, student, staff
├── components/                # layout (sidebar, page-header), auth (AuthGuard), maps, tracking, ui
├── services/                  # Axios API wrappers (one per domain)
├── hooks/                     # use-driver-location (DriverLocationRuntime singleton)
├── types/                     # TS mirrors of backend DTOs
└── lib/constants.ts           # ROLES, ROUTES, homeRouteForRoles()
```

### Patterns

- **AuthGuard** wraps each portal layout with the allowed roles, e.g.
  `<AuthGuard roles={[ROLES.SUPER_ADMIN]}>`.
- **Routing by role:** `homeRouteForRoles(roles)` maps the highest-priority role to its home route.
- **Services** call Axios and `clean()` payloads (drop empty strings) before POST/PUT.
- **`apiErrorMessage(error, fallback)`** extracts a friendly message from Axios errors.
- **Driver GPS:** `DriverLocationRuntime` is a singleton so location survives navigation/minimize; it uses
  `watchPosition`, a `WakeLock`, `localStorage` for the enabled flag, and an offline queue. `enable()` returns
  an error string or `null`.
- **Maps:** `components/maps/live-map*.tsx` render the bus, route polyline, and stop markers; the
  `RouteTrackPanel` lists stops with current/next/your-stop highlights and ETA.

## Live tracking data model

`LiveTrackingResponse` carries: bus position (`latitude/longitude/speed/heading`), `tripStatus`,
`distanceRemaining`, `etaMinutes`, current/next/student stop identifiers and names, `busNumber`, `routeName`,
and a `stops[]` list of `TrackingStopResponse` (id, name, order, lat/lng, address, ETA mins).
