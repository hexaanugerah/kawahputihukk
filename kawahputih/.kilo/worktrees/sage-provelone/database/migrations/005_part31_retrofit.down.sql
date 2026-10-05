ALTER TABLE bookings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE tourism_packages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE gallery_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE articles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE role_permissions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE user_roles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE permissions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE roles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE auth_tokens CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE refresh_tokens CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

ALTER TABLE articles DROP INDEX idx_article_search;

ALTER TABLE bookings DROP COLUMN deleted_by, DROP COLUMN updated_by;
ALTER TABLE tourism_packages DROP KEY idx_tourism_packages_created_by, DROP COLUMN deleted_by, DROP COLUMN updated_by, DROP COLUMN created_by;
ALTER TABLE gallery_items DROP COLUMN deleted_by, DROP COLUMN updated_by;
ALTER TABLE articles DROP KEY idx_articles_created_by, DROP COLUMN deleted_by, DROP COLUMN updated_by, DROP COLUMN created_by;
ALTER TABLE permissions DROP COLUMN deleted_by, DROP COLUMN updated_by, DROP COLUMN created_by;
ALTER TABLE roles DROP COLUMN deleted_by, DROP COLUMN updated_by, DROP COLUMN created_by;
ALTER TABLE users DROP KEY idx_users_updated_by, DROP KEY idx_users_created_by, DROP COLUMN deleted_by, DROP COLUMN updated_by, DROP COLUMN created_by;

ALTER TABLE bookings RENAME KEY uk_bookings_ticket_code TO uq_bookings_ticket_code;
ALTER TABLE tourism_packages RENAME KEY uk_tourism_packages_slug TO uq_tourism_packages_slug;
ALTER TABLE articles RENAME KEY uk_articles_slug TO uq_articles_slug;
ALTER TABLE permissions RENAME KEY uk_permissions_code TO uq_permissions_code;
ALTER TABLE roles RENAME KEY uk_roles_name TO uq_roles_name;
ALTER TABLE users RENAME KEY uk_users_google_id TO uq_users_google_id;
ALTER TABLE users RENAME KEY uk_users_email TO uq_users_email;
