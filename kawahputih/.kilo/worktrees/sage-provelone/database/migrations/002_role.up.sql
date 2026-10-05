CREATE TABLE IF NOT EXISTS roles (
    id          CHAR(36)     NOT NULL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    created_at  DATETIME(3)  NOT NULL,
    updated_at  DATETIME(3)  NOT NULL,
    deleted_at  DATETIME(3)  NULL,
    UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions (
    id          CHAR(36)     NOT NULL PRIMARY KEY,
    code        VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    created_at  DATETIME(3)  NOT NULL,
    updated_at  DATETIME(3)  NOT NULL,
    deleted_at  DATETIME(3)  NULL,
    UNIQUE KEY uq_permissions_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- No FK to users(id) here on purpose: the role domain deliberately does not
-- declare a Go-level dependency on the auth domain's User struct (see
-- role/entity.go's comment), but the tables still live in the same MySQL
-- instance, so a DB-level FK for referential integrity is still correct
-- and cheap — independence is a Go-import-graph concept, not a "the
-- database must not know these are related" one.
CREATE TABLE IF NOT EXISTS user_roles (
    user_id CHAR(36) NOT NULL,
    role_id CHAR(36) NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: 7 roles per the BRD's stakeholder analysis.
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'Full operational access: content, booking, payment, users', NOW(3), NOW(3)),
('00000000-0000-0000-0000-000000000002', 'staff_ticketing', 'Manages bookings, check-in, and visitor flow', NOW(3), NOW(3)),
('00000000-0000-0000-0000-000000000003', 'staff_content', 'Manages articles, gallery, events, promotions', NOW(3), NOW(3)),
('00000000-0000-0000-0000-000000000004', 'visitor', 'Public visitor / customer account', NOW(3), NOW(3)),
('00000000-0000-0000-0000-000000000005', 'super_admin', 'Manages roles, permissions, site config, audit log, backup/restore', NOW(3), NOW(3)),
('00000000-0000-0000-0000-000000000006', 'owner', 'Read-only business dashboard: revenue, analytics, reports', NOW(3), NOW(3)),
('00000000-0000-0000-0000-000000000007', 'finance_admin', 'Verifies payments, processes refunds, generates financial reports', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO permissions (id, code, description, created_at, updated_at) VALUES
('10000000-0000-0000-0000-000000000001', 'booking:create', 'Create a ticket booking', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000002', 'booking:manage', 'Manage/refund any booking', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000003', 'checkin:scan', 'Scan QR tickets at the gate', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000004', 'content:publish', 'Publish articles/gallery/events', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000005', 'user:manage', 'Manage staff accounts (activate/deactivate)', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000006', 'report:view', 'View analytics and reports', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000007', 'role:manage', 'Create/edit roles and assign them to users', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000008', 'permission:manage', 'Create/edit permissions and role-permission mapping', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000009', 'config:manage', 'Manage site-wide configuration', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000010', 'audit:view', 'View the audit log', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000011', 'backup:manage', 'Trigger database backup/restore', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000012', 'payment:verify', 'Verify/reconcile incoming payments', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000013', 'payment:refund', 'Process a booking refund', NOW(3), NOW(3)),
('10000000-0000-0000-0000-000000000014', 'report:financial', 'Generate and export financial reports', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- admin: operational only — role/permission/config/backup stay super_admin-exclusive
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004'),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005'),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006');

INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003');

INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004');

INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001');

-- super_admin: everything
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000005', id FROM permissions;

-- owner: strictly read-only
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006');

-- finance_admin
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006'),
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000012'),
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000013'),
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000014');
