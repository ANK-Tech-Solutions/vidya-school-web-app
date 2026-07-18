-- Allow FINGERPRINT as a bus boarding capture method (QR / RFID-NFC / FACE / FINGERPRINT / MANUAL / GEOFENCE).

ALTER TABLE attendance DROP CHECK chk_attendance_method;
ALTER TABLE attendance ADD CONSTRAINT chk_attendance_method CHECK (
    method IN ('QR', 'RFID', 'FACE', 'FINGERPRINT', 'MANUAL', 'GEOFENCE')
);
