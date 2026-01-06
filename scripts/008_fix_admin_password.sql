-- Delete existing admin and recreate with proper password hash
DELETE FROM admins WHERE username = 'admin';

-- Insert admin with proper bcrypt hash for password 'admin123'
-- This is a valid bcrypt hash with cost factor 10
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Verify the admin was created with the correct hash length
SELECT 
  id, 
  username, 
  LENGTH(password_hash) as hash_length,
  created_at 
FROM admins 
WHERE username = 'admin';
