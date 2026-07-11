# Entity relationship diagram

The diagram focuses on application tables used by authentication, transport operations, tracking, notifications, and reporting. Audit/settings tables are omitted from the visual for readability.

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
  STUDENTS ||--o{ ATTENDANCE : has
  TRIPS o|--o{ ATTENDANCE : records
  BUSES o|--o{ ATTENDANCE : occurs_on
  USERS o|--o{ ATTENDANCE : verifies
  USERS o|--o{ NOTIFICATIONS : receives

  SCHOOLS {
    number id PK
    string code UK
    string name
  }
  USERS {
    number id PK
    number school_id FK
    string username UK
    string email UK
    boolean is_active
  }
  ROLES {
    number id PK
    string name UK
  }
  REFRESH_TOKENS {
    number id PK
    number user_id FK
    string token UK
    timestamp expires_at
    boolean revoked
  }
  PARENTS {
    number id PK
    number user_id FK
    number school_id FK
    string fcm_token
  }
  DRIVERS {
    number id PK
    number user_id FK
    number school_id FK
    string license_number UK
    boolean location_enabled
  }
  STUDENTS {
    number id PK
    number user_id FK
    number school_id FK
    number parent_id FK
    string student_code
  }
  BUSES {
    number id PK
    number school_id FK
    string bus_number
    string plate_number UK
    string status
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
    string trip_type
  }
  TRIPS {
    number id PK
    number school_id FK
    number bus_id FK
    number driver_id FK
    number route_id FK
    string status
  }
  TRIP_LOCATIONS {
    number id PK
    number trip_id FK
    number latitude
    number longitude
    timestamp recorded_at
  }
  ATTENDANCE {
    number id PK
    number school_id FK
    number student_id FK
    number trip_id FK
    number bus_id FK
    string event_type
  }
  NOTIFICATIONS {
    number id PK
    number school_id FK
    number user_id FK
    string type
    boolean is_read
  }
```
