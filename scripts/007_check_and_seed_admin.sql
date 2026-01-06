-- Check if admin exists
SELECT * FROM admins;

-- If no admin exists, create one with username 'admin' and password 'admin123'
-- Password hash for 'admin123' using bcrypt with 10 rounds
INSERT INTO admins (username, password_hash)
SELECT 'admin', '$2a$10$YQ7LKeEQNme4kPNXE6PJgeTcSvKzf3hXYs7N6jE9z5FvKGJYmVHXi'
WHERE NOT EXISTS (
  SELECT 1 FROM admins WHERE username = 'admin'
);

-- Verify the admin was created
SELECT id, username, created_at FROM admins;
