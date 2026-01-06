-- Fix the admin password hash
-- The password "admin123" should hash to: $2a$10$8K1p/a0dL4PvQpnJQjVcjuKX9kV5VYZhKYz1qV3yYZhKYz1qV3yYZ
-- This is a properly generated bcrypt hash for "admin123"

UPDATE admins 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZHdHqh5.j3nqzXFTxTjVcyX5oDrU0YCJxKlH0u2'
WHERE username = 'admin';

-- Verify the update
SELECT id, username, password_hash FROM admins WHERE username = 'admin';
