-- Demo fleet + assignments so driver1 / parent1 flows work out of the box

INSERT INTO buses (
    school_id, bus_number, plate_number, make, model, year_of_make, capacity, color,
    gps_device_id, status, created_by, updated_by
) VALUES (
    (SELECT id FROM schools WHERE code = 'DEMO001'),
    'BUS-01', 'KA01AB1234', 'Tata', 'Starbus', 2022, 40, 'Yellow',
    'GPS-DEMO-01', 'ACTIVE', 'SYSTEM', 'SYSTEM'
);

INSERT INTO routes (
    school_id, name, code, description,
    start_latitude, start_longitude, end_latitude, end_longitude,
    estimated_duration_mins, distance_km, is_active, created_by, updated_by
) VALUES (
    (SELECT id FROM schools WHERE code = 'DEMO001'),
    'Indiranagar Morning Route', 'RT-IND-01',
    'Demo morning pickup route covering Indiranagar and surrounding stops',
    12.9784000, 77.6408000, 12.9716000, 77.5946000,
    45, 12.50, TRUE, 'SYSTEM', 'SYSTEM'
);

INSERT INTO route_stops (route_id, name, stop_order, latitude, longitude, address, estimated_arrival_mins, geofence_radius_m)
VALUES
    ((SELECT id FROM routes WHERE code = 'RT-IND-01'), 'Park Street Gate', 1, 12.9750000, 77.6000000, '45 Park Street, Bengaluru', 5, 100),
    ((SELECT id FROM routes WHERE code = 'RT-IND-01'), '100 Feet Road Junction', 2, 12.9780000, 77.6380000, '100 Feet Road, Indiranagar', 15, 100),
    ((SELECT id FROM routes WHERE code = 'RT-IND-01'), 'School Main Gate', 3, 12.9716000, 77.5946000, 'Vidya International School', 45, 120);

INSERT INTO driver_bus (
    driver_id, bus_id, route_id, assigned_from, is_primary, is_active, created_by, updated_by
) VALUES (
    (SELECT d.id FROM drivers d JOIN users u ON u.id = d.user_id WHERE u.username = 'driver1'),
    (SELECT id FROM buses WHERE bus_number = 'BUS-01'),
    (SELECT id FROM routes WHERE code = 'RT-IND-01'),
    CURRENT_DATE, TRUE, TRUE, 'SYSTEM', 'SYSTEM'
);

INSERT INTO student_bus (
    student_id, bus_id, route_id, stop_id, trip_type, assigned_from, is_active, created_by, updated_by
) VALUES (
    (SELECT id FROM students WHERE student_code = 'STU001'),
    (SELECT id FROM buses WHERE bus_number = 'BUS-01'),
    (SELECT id FROM routes WHERE code = 'RT-IND-01'),
    (SELECT id FROM route_stops WHERE name = 'Park Street Gate' AND route_id = (SELECT id FROM routes WHERE code = 'RT-IND-01')),
    'BOTH', CURRENT_DATE, TRUE, 'SYSTEM', 'SYSTEM'
);
