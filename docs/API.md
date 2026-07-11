# API catalog

Base URL: `/api/v1`. REST endpoints return the application's `ApiResponse` envelope. Send `Authorization: Bearer <access-token>` after login. List endpoints generally accept `page` (zero-based) and `size`; admin people/bus/route lists also accept `search` (students additionally accept `grade` and `sort`).

Swagger UI is available at `/swagger-ui.html`, with the OpenAPI document at `/api-docs`.

## Auth

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/login` | Authenticate username/password and receive access/refresh tokens |
| POST | `/auth/refresh` | Exchange a valid refresh token |
| POST | `/auth/logout` | Revoke a refresh token |
| GET | `/auth/me` | Return the authenticated user |

## Admin

All admin endpoints are scoped to the administrator's school.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/admin/dashboard/stats` | Dashboard totals and operational statistics |
| GET/POST | `/admin/students` | List/create students |
| GET/PUT | `/admin/students/{id}` | Get/update a student |
| PATCH | `/admin/students/{id}/deactivate` | Deactivate a student |
| GET/POST | `/admin/parents` | List/create parents |
| GET/PUT | `/admin/parents/{id}` | Get/update a parent |
| PATCH | `/admin/parents/{id}/deactivate` | Deactivate a parent |
| GET/POST | `/admin/drivers` | List/create drivers |
| GET/PUT | `/admin/drivers/{id}` | Get/update a driver |
| PATCH | `/admin/drivers/{id}/deactivate` | Deactivate a driver |
| GET/POST | `/admin/buses` | List/create buses |
| GET/PUT | `/admin/buses/{id}` | Get/update a bus |
| PATCH | `/admin/buses/{id}/deactivate` | Mark a bus inactive |
| GET/POST | `/admin/routes` | List/create routes with stops |
| GET/PUT | `/admin/routes/{id}` | Get/update a route |
| PATCH | `/admin/routes/{id}/deactivate` | Deactivate a route |
| GET | `/admin/assignments` | List driver/student assignments |
| POST | `/admin/assignments/drivers` | Assign a driver to a bus/route |
| POST | `/admin/assignments/students` | Assign a student to a bus/route/stop |
| PATCH | `/admin/assignments/{id}/deactivate` | Deactivate an assignment |
| GET | `/admin/notifications` | Paginated sent notifications |
| GET | `/admin/notifications/recent` | Recent notifications (`limit`) |
| POST | `/admin/notifications/broadcast` | Broadcast a notification |
| GET | `/admin/reports/trips` | Trip report (`from`, `to`, pagination) |
| GET | `/admin/reports/attendance` | Attendance report (`from`, `to`, pagination) |
| GET | `/admin/reports/summary` | Summary report (`from`, `to`) |
| GET | `/admin/reports/drivers/performance` | Driver performance (`from`, `to`) |

## Driver

| Method | Path | Description |
| --- | --- | --- |
| GET | `/driver/dashboard` | Driver dashboard |
| GET/PUT | `/driver/profile` | Read/update driver profile |
| PUT | `/driver/fcm-token` | Register or update FCM token |
| GET | `/driver/bus` | Assigned bus |
| GET | `/driver/route` | Assigned route and stops |
| GET | `/driver/students/today` | Students expected today |
| POST | `/driver/location/enable` | Enable location sharing |
| POST | `/driver/location/disable` | Disable location sharing |
| POST | `/driver/location` | Persist a location update |
| POST | `/driver/trips/start` | Start a trip |
| POST | `/driver/trips/end` | End the active trip |
| POST | `/driver/trips/sos` | Raise an SOS/emergency event |
| GET | `/driver/trips/history` | Paginated trip history |
| GET | `/driver/trips/active` | Current active trip |

## Student / parent

Parents access their linked children. `studentId` is optional where exposed so a parent can select a child.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/student/dashboard` | Dashboard |
| GET | `/student/children` | Linked child list |
| GET | `/student/profile` | Student profile |
| GET | `/student/bus` | Assigned bus |
| GET | `/student/driver` | Assigned driver |
| GET | `/student/route` | Route and pickup/drop details |
| GET | `/student/tracking` | Latest persisted live-tracking position |
| GET | `/student/attendance` | Paginated attendance |
| GET | `/student/trips/history` | Paginated trip history |
| GET | `/student/notifications` | Paginated notifications |
| PUT | `/student/fcm-token` | Register or update FCM token |
| PATCH | `/student/notifications/{id}/read` | Mark a notification read |

## Live WebSocket API

Connect to `/ws` with SockJS and include `Authorization: Bearer <access-token>` in STOMP CONNECT headers. Drivers publish a `LocationUpdateRequest` to `/app/driver/location` (an optional `tripId` header is supported). Authenticated clients subscribe to:

- `/topic/trips/{tripId}/location`
- `/topic/school/{schoolId}/buses`

Only drivers may send location messages. HTTP `POST /driver/location` is the REST fallback.
