# YuwaShop PHP/MySQL backend contract

Frontend data access is isolated in `user/assets/js/data-service.js`. The static demo uses `localStorage` for cart/favorites/session UI state; a PHP API can be enabled by setting `MiniShopAPI.config.useBackend = true` and changing `apiBaseUrl`. Authentication should use a PHP session or HttpOnly cookie in production.

## API response format

Return JSON for every endpoint:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

For errors, use an appropriate HTTP status and:

```json
{
  "success": false,
  "data": null,
  "message": "Validation message"
}
```

The frontend accepts both this envelope and a raw JSON array/object during migration.

## Endpoints

| Method | Endpoint | Request body | Response data |
| --- | --- | --- | --- |
| GET | `/api/products` | query: `category`, `search`, `sort`, `page`, `limit` | `{ items, total, page, limit }` |
| GET | `/api/products/{id}` | none | product object |
| GET | `/api/locations` | query: `city`, `latitude`, `longitude` | `{ cities: [{ city, stores: [] }] }` |
| GET | `/api/stores/{id}` | none | store object |
| GET | `/api/favorites` | session cookie | product summary array |
| POST | `/api/favorites` | `{ "productId": 1 }` | product summary array or created favorite |
| DELETE | `/api/favorites/{productId}` | none | updated favorite array |
| GET | `/api/cart` | session cookie | `{ items, subtotal, total }` |
| POST | `/api/cart/items` | `{ "productId": 1, "quantity": 1 }` | updated cart |
| PATCH | `/api/cart/items/{productId}` | `{ "quantity": 2 }` | updated cart |
| DELETE | `/api/cart/items/{productId}` | none | updated cart |
| POST | `/api/auth/register` | `{ "name", "email", "password" }` | `{ user, token? }` |
| POST | `/api/auth/login` | `{ "email", "password" }` | `{ user, token? }` |
| POST | `/api/auth/logout` | none | `null` |
| GET | `/api/auth/me` | session cookie | current user |
| POST | `/api/orders` | `{ "items": [{ "productId": 1, "quantity": 1 }], "shipping": {} }` | `{ order, items }` |
| GET | `/api/orders` | session cookie, query: `page`, `limit` | `{ items, total, page, limit }` |
| GET | `/api/orders/{id}` | session cookie | order with items |

### Admin endpoints

Admin routes should require an authenticated admin session and a permission check. Keep list endpoints paginated and return `{ items, total, page, limit }` where applicable.

| Method | Endpoint | Request body/query | Response data |
| --- | --- | --- | --- |
| GET | `/api/admin/summary` | query: `from`, `to`, `storeId` | KPI totals and time-series metrics |
| GET | `/api/admin/inventory` | query: `search`, `lowStock`, `page`, `limit` | inventory items with stock levels |
| PATCH | `/api/admin/inventory/{productId}` | `{ "stock": 25, "reorderLevel": 10 }` | updated inventory item |
| GET | `/api/admin/promotions` | query: `status`, `page`, `limit` | promotion list |
| POST | `/api/admin/promotions` | promotion payload | created promotion |
| PATCH | `/api/admin/promotions/{id}` | promotion changes | updated promotion |
| GET | `/api/admin/staff` | query: `status`, `page`, `limit` | staff users and roles |
| POST | `/api/admin/staff/invite` | `{ "email", "roleId" }` | invitation |
| GET | `/api/admin/audit-log` | query: `actorId`, `action`, `page`, `limit` | audit events |
| PATCH | `/api/admin/settings` | settings payload | saved settings |

Use PHP sessions or an HttpOnly session cookie. Do not store passwords or authentication tokens in `localStorage` in production.

## Suggested MySQL schema

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2) NULL,
  image_url VARCHAR(500) NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_category_active (category, is_active),
  INDEX idx_products_name (name)
);

CREATE TABLE stores (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  opening_hours VARCHAR(120) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stores_city_active (city, is_active)
);

CREATE TABLE favorites (
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE carts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  session_id VARCHAR(128) NULL UNIQUE,
  status ENUM('active', 'converted', 'abandoned') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
  cart_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (cart_id, product_id),
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE orders (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending', 'confirmed', 'shipping', 'completed', 'canceled') NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  shipping_name VARCHAR(120) NOT NULL,
  shipping_phone VARCHAR(30) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_orders_user_created (user_id, created_at)
);

CREATE TABLE order_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(180) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE roles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
);

CREATE TABLE user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE inventory (
  product_id BIGINT UNSIGNED PRIMARY KEY,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  reorder_level INT UNSIGNED NOT NULL DEFAULT 10,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE promotions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(80) NOT NULL UNIQUE,
  type ENUM('percentage', 'fixed', 'shipping') NOT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  usage_limit INT UNSIGNED NULL,
  usage_count INT UNSIGNED NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  actor_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_actor_created (actor_id, created_at),
  INDEX idx_audit_entity (entity_type, entity_id)
);

CREATE TABLE store_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value JSON NOT NULL,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

## PHP implementation notes

- Use PDO with prepared statements for every query.
- Hash passwords with `password_hash()` and verify with `password_verify()`.
- Validate product ownership and quantity server-side; never trust prices from the browser.
- Return product `id` from the database. The current frontend falls back to a stable slug only for static demo cards.
- Enable CORS only when frontend and API are on different origins; prefer same-origin deployment for PHP sessions.
- Add CSRF protection for cookie-authenticated state-changing requests.
