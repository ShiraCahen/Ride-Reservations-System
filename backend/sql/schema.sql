CREATE DATABASE IF NOT EXISTS ride_reservations;
USE ride_reservations;

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rider_first_name VARCHAR(120) NOT NULL,
  rider_last_name VARCHAR(120) NOT NULL,
  pickup_location VARCHAR(255) NOT NULL,
  dropoff_location VARCHAR(255) NOT NULL,
  pickup_time DATETIME NOT NULL,
  passenger_count TINYINT UNSIGNED NOT NULL,
  phone_number VARCHAR(32) NOT NULL,
  special_requirements TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

