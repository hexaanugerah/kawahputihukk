CREATE TABLE IF NOT EXISTS articles (
    id            CHAR(36)     NOT NULL PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    slug          VARCHAR(220) NOT NULL,
    excerpt       VARCHAR(500) NULL,
    content       LONGTEXT     NOT NULL,
    cover_image   VARCHAR(500) NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'draft',
    author_id     CHAR(36)     NOT NULL,
    published_at  BIGINT       NULL,
    created_at    DATETIME(3)  NOT NULL,
    updated_at    DATETIME(3)  NOT NULL,
    deleted_at    DATETIME(3)  NULL,
    UNIQUE KEY uq_articles_slug (slug),
    KEY idx_articles_status (status),
    CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gallery_items (
    id          CHAR(36)     NOT NULL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    image_url   VARCHAR(500) NOT NULL,
    category    VARCHAR(100) NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    uploaded_by CHAR(36)     NOT NULL,
    created_at  DATETIME(3)  NOT NULL,
    updated_at  DATETIME(3)  NOT NULL,
    deleted_at  DATETIME(3)  NULL,
    KEY idx_gallery_items_category (category),
    CONSTRAINT fk_gallery_items_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tourism_packages (
    id             CHAR(36)     NOT NULL PRIMARY KEY,
    name           VARCHAR(200) NOT NULL,
    slug           VARCHAR(220) NOT NULL,
    description    TEXT         NULL,
    cover_image    VARCHAR(500) NULL,
    price_cents    BIGINT       NOT NULL,
    currency       VARCHAR(3)   NOT NULL DEFAULT 'IDR',
    duration_hours INT          NOT NULL DEFAULT 1,
    max_capacity   INT          NOT NULL DEFAULT 0,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     DATETIME(3)  NOT NULL,
    updated_at     DATETIME(3)  NOT NULL,
    deleted_at     DATETIME(3)  NULL,
    UNIQUE KEY uq_tourism_packages_slug (slug),
    KEY idx_tourism_packages_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
