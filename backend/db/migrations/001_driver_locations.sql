-- Driver live location table
-- Run once against your MySQL database IF you also have one.
-- NOTE: The primary data store for thefleetfly is MongoDB (Mongoose).
-- This migration is provided for reference if you migrate to SQL later.
-- The live location system currently uses the in-memory LocationService
-- (backend/services/locationService.js) which is already wired to Socket.io.

CREATE TABLE IF NOT EXISTS driver_locations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  driver_id   VARCHAR(36)    NOT NULL,
  lat         DECIMAL(10, 8) NOT NULL,
  lng         DECIMAL(11, 8) NOT NULL,
  accuracy    FLOAT          DEFAULT NULL,
  is_moving   BOOLEAN        DEFAULT TRUE,
  updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY  uq_driver  (driver_id),
  INDEX       idx_updated (updated_at)
);
