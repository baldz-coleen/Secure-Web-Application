-- Run this in phpMyAdmin or MySQL CLI after creating database: secure_web_app
-- Create database (optional, if not exists):
-- CREATE DATABASE IF NOT EXISTS secure_web_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE secure_web_app;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
