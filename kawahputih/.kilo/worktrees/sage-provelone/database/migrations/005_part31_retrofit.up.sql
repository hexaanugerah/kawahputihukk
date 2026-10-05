-- Retrofit for Part 3.1's database standard. Scoped to tables that already
-- exist and are backed by real code — this does NOT create the ~70 tables
-- Part 3.1 estimates, most of which belong to modules with no backend yet
-- (destinations-as-separate-from-packages, categories, facilities,
-- separate tickets, refunds, vouchers, notifications, audit_logs,
-- settings, weather_cache, visitor_statistics). Those get their own
-- migration when their module is actually built — adding empty tables now
-- would just be schema for code that doesn't exist.

-- ---------------------------------------------------------------------
-- 1. Rename unique keys: uq_* -> uk_* (Part 3.1 naming convention).
--    RENAME KEY is MySQL 8+ syntax — a rename, not a drop+recreate, so it
--    doesn't touch existing data or require rebuilding the index.
-- ---------------------------------------------------------------------
ALTER TABLE users RENAME KEY uq_users_email TO uk_users_email;
ALTER TABLE users RENAME KEY uq_users_google_id TO uk_users_google_id;
ALTER TABLE roles RENAME KEY uq_roles_name TO uk_roles_name;
ALTER TABLE permissions RENAME KEY uq_permissions_code TO uk_permissions_code;
ALTER TABLE articles RENAME KEY uq_articles_slug TO uk_articles_slug;
ALTER TABLE tourism_packages RENAME KEY uq_tourism_packages_slug TO uk_tourism_packages_slug;
ALTER TABLE bookings RENAME KEY uq_bookings_ticket_code TO uk_bookings_ticket_code;

-- ---------------------------------------------------------------------
-- 2. Audit columns (created_by / updated_by / deleted_by) on tables an
--    admin/staff actually mutates. NOT applied to refresh_tokens or
--    auth_tokens — those are system-issued, never admin-edited, so "who
--    created this" is always "the system", not a useful audit fact.
--
--    No FK constraint on these columns to users(id): a chicken-and-egg
--    problem exists for the very first user (created_by would have to
--    reference a user that doesn't exist yet), and self-referencing FKs
--    on `users` complicate cascade behavior for no real benefit here.
--    They're indexed instead, which is what audit queries actually need.
-- ---------------------------------------------------------------------
ALTER TABLE users
    ADD COLUMN created_by CHAR(36) NULL AFTER updated_at,
    ADD COLUMN updated_by CHAR(36) NULL AFTER created_by,
    ADD COLUMN deleted_by CHAR(36) NULL AFTER updated_by,
    ADD KEY idx_users_created_by (created_by),
    ADD KEY idx_users_updated_by (updated_by);

ALTER TABLE roles
    ADD COLUMN created_by CHAR(36) NULL AFTER updated_at,
    ADD COLUMN updated_by CHAR(36) NULL AFTER created_by,
    ADD COLUMN deleted_by CHAR(36) NULL AFTER updated_by;

ALTER TABLE permissions
    ADD COLUMN created_by CHAR(36) NULL AFTER updated_at,
    ADD COLUMN updated_by CHAR(36) NULL AFTER created_by,
    ADD COLUMN deleted_by CHAR(36) NULL AFTER updated_by;

ALTER TABLE articles
    ADD COLUMN created_by CHAR(36) NULL AFTER author_id,
    ADD COLUMN updated_by CHAR(36) NULL AFTER created_by,
    ADD COLUMN deleted_by CHAR(36) NULL AFTER updated_by,
    ADD KEY idx_articles_created_by (created_by);

ALTER TABLE gallery_items
    ADD COLUMN updated_by CHAR(36) NULL AFTER uploaded_by,
    ADD COLUMN deleted_by CHAR(36) NULL AFTER updated_by;
    -- gallery_items already has `uploaded_by`, which IS created_by under a
    -- more descriptive name for this table — not duplicated.

ALTER TABLE tourism_packages
    ADD COLUMN created_by CHAR(36) NULL AFTER max_capacity,
    ADD COLUMN updated_by CHAR(36) NULL AFTER created_by,
    ADD COLUMN deleted_by CHAR(36) NULL AFTER updated_by,
    ADD KEY idx_tourism_packages_created_by (created_by);

ALTER TABLE bookings
    ADD COLUMN updated_by CHAR(36) NULL AFTER checked_in_by,
    ADD COLUMN deleted_by CHAR(36) NULL AFTER updated_by;
    -- bookings already has `user_id` (=created_by, the visitor who booked)
    -- and `checked_in_by` — both more descriptive than a generic
    -- created_by for this table, so not duplicated either.

-- ---------------------------------------------------------------------
-- 3. FULLTEXT search index on articles, per Part 3.1's
--    "FULLTEXT INDEX idx_article_search" example.
-- ---------------------------------------------------------------------
ALTER TABLE articles ADD FULLTEXT INDEX idx_article_search (title, excerpt, content);

-- ---------------------------------------------------------------------
-- 4. Explicit collation (Part 3.1 specifies utf8mb4_unicode_ci; the
--    original migrations set CHARSET=utf8mb4 but left collation at
--    MySQL 8's default of utf8mb4_0900_ai_ci).
-- ---------------------------------------------------------------------
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE refresh_tokens CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE auth_tokens CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE roles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE permissions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_roles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE role_permissions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE articles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE gallery_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE tourism_packages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE bookings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
