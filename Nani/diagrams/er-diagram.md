# Entity relationship diagram

Reflects the MySQL schema created by Flyway migrations `V1` (core) and `V5` (branding + academic SIS).
Audit/settings tables are omitted from the visual for readability.

## Core transport & auth

```mermaid
erDiagram
  SCHOOLS ||--o{ USERS : owns
  SCHOOLS ||--o{ PARENTS : has
  SCHOOLS ||--o{ DRIVERS : has
  SCHOOLS ||--o{ STUDENTS : enrolls
  SCHOOLS ||--o{ BUSES : owns
  SCHOOLS ||--o{ ROUTES : defines
  SCHOOLS ||--o{ TRIPS : operates
  SCHOOLS ||--o{ NOTIFICATIONS : sends
  USERS }o--o{ ROLES : user_roles
  USERS ||--o{ REFRESH_TOKENS : issues
  USERS ||--o| PARENTS : profile
  USERS ||--o| DRIVERS : profile
  USERS ||--o{ STUDENTS : optional_login
  PARENTS ||--o{ STUDENTS : responsible_for
  ROUTES ||--o{ ROUTE_STOPS : contains
  DRIVERS ||--o{ DRIVER_BUS : assigned
  BUSES ||--o{ DRIVER_BUS : assigned
  ROUTES o|--o{ DRIVER_BUS : follows
  STUDENTS ||--o{ STUDENT_BUS : assigned
  BUSES ||--o{ STUDENT_BUS : assigned
  ROUTES o|--o{ STUDENT_BUS : follows
  ROUTE_STOPS o|--o{ STUDENT_BUS : pickup_stop
  BUSES ||--o{ TRIPS : serves
  DRIVERS ||--o{ TRIPS : drives
  ROUTES ||--o{ TRIPS : follows
  TRIPS ||--o{ TRIP_LOCATIONS : records
  TRIPS ||--o{ TRIP_STOP_EVENTS : arrivals
  ROUTE_STOPS ||--o{ TRIP_STOP_EVENTS : at
  STUDENTS ||--o{ ATTENDANCE : has
  TRIPS o|--o{ ATTENDANCE : records

  SCHOOLS {
    number id PK
    string code UK
    string name
    string app_name
    string app_icon_url
    boolean is_active
  }
  USERS {
    number id PK
    number school_id FK "NULL for SUPER_ADMIN"
    string username UK
    string email UK
    boolean is_active
  }
  ROLES {
    number id PK
    string name UK "SUPER_ADMIN|ADMIN|VEHICLE_INCHARGE|DRIVER|TEACHER|STUDENT|PARENT|STAFF"
  }
  DRIVERS {
    number id PK
    number user_id FK
    number school_id FK
    string license_number UK
    boolean is_online
    boolean location_enabled
    decimal last_latitude
    decimal last_longitude
  }
  BUSES {
    number id PK
    number school_id FK
    string bus_number
    string plate_number UK
    string status "ACTIVE|MAINTENANCE|INACTIVE|RETIRED"
  }
  ROUTES {
    number id PK
    number school_id FK
    string code
    boolean is_active
  }
  ROUTE_STOPS {
    number id PK
    number route_id FK
    number stop_order
    decimal latitude
    decimal longitude
    number estimated_arrival_mins
  }
  DRIVER_BUS {
    number id PK
    number driver_id FK
    number bus_id FK
    number route_id FK
    boolean is_active
  }
  STUDENT_BUS {
    number id PK
    number student_id FK
    number bus_id FK
    number route_id FK
    number stop_id FK
    string trip_type "PICKUP|DROPOFF|BOTH"
  }
  TRIPS {
    number id PK
    number school_id FK
    number bus_id FK
    number driver_id FK
    number route_id FK
    string trip_type "MORNING|EVENING|SPECIAL"
    string status "SCHEDULED|IN_PROGRESS|COMPLETED|CANCELLED|EMERGENCY"
  }
  TRIP_LOCATIONS {
    number id PK
    number trip_id FK
    decimal latitude
    decimal longitude
    timestamp recorded_at
  }
  TRIP_STOP_EVENTS {
    number id PK
    number trip_id FK
    number stop_id FK
    string event_type "ARRIVED"
    timestamp recorded_at
  }
  ATTENDANCE {
    number id PK
    number student_id FK
    number trip_id FK
    string method "QR|RFID|FACE|FINGERPRINT|MANUAL|GEOFENCE"
    string event_type "BOARDING|ALIGHTING|PRESENT|ABSENT"
  }
  NOTIFICATIONS {
    number id PK
    number school_id FK
    number user_id FK
    string type
    boolean is_read
  }
```

## Academic SIS (V5)

```mermaid
erDiagram
  SCHOOLS ||--o{ TEACHERS : employs
  USERS ||--o| TEACHERS : profile
  TEACHERS ||--o{ TIMETABLE_SLOTS : teaches
  TEACHERS ||--o{ HOMEWORK : assigns
  TEACHERS ||--o{ STUDY_MATERIALS : shares
  STUDENTS ||--o{ CLASS_ATTENDANCE : marked
  EXAMS ||--o{ EXAM_RESULTS : grades
  STUDENTS ||--o{ EXAM_RESULTS : scores
  STUDENTS ||--o{ FEE_INVOICES : billed
  TEACHERS ||--o{ SALARY_RECORDS : paid
  SCHOOLS ||--o{ NOTICE_BOARD : posts
  SCHOOLS ||--o{ CALENDAR_EVENTS : schedules
  SCHOOLS ||--o{ LEAVE_REQUESTS : receives

  TEACHERS {
    number id PK
    number user_id FK
    number school_id FK
    string employee_code
  }
  TIMETABLE_SLOTS {
    number id PK
    number school_id FK
    number teacher_id FK
    number day_of_week "INT"
  }
  EXAMS {
    number id PK
    number school_id FK
    date exam_date
  }
  EXAM_RESULTS {
    number id PK
    number exam_id FK
    number student_id FK
    decimal marks_obtained
  }
  LEAVE_REQUESTS {
    number id PK
    number school_id FK
    number requester_user_id FK
    string status "PENDING|APPROVED|REJECTED|CANCELLED"
  }
```

## Notes

- **Multi-tenancy:** almost every table carries `school_id`. `SUPER_ADMIN` users have `school_id = NULL`.
- **Roles are many-to-many** via the `user_roles` join table.
- **Live tracking** reads `trips` (active), `trip_locations` (breadcrumbs), `route_stops` (the ordered stop
  list with ETA), and the driver's `last_latitude/last_longitude`.
- Full column-level definitions live in the migrations; see
  [`../developer-guides/database-and-migrations.md`](../developer-guides/database-and-migrations.md).
