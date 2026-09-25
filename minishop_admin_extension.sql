-- ==============================================================================
-- FILE BỔ SUNG CƠ SỞ DỮ LIỆU: QUẢN TRỊ 5 PHÂN HỆ ADMIN PRO
-- Hệ thống: MiniShop / YuwaShop E-Commerce
-- Chạy SAU file: minishop_db.sql
-- Áp dụng cho 5 trang: Inventory, Promotions, Staff & roles, Audit log, Settings
-- Chuẩn kỹ thuật: MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+, ENGINE=InnoDB, CHARSET=utf8mb4
-- ==============================================================================

USE `minishop_db`;
SET NAMES utf8mb4;

-- ==============================================================================
-- 1. BẢNG PRODUCTS: Bổ sung ngưỡng tồn kho tối thiểu (min_stock)
-- Dùng để tính toán trạng thái Còn hàng / Sắp hết / Hết hàng trên trang Inventory
-- Logic hiển thị:
--   - stock_quantity = 0: "Hết hàng" (Badge Đỏ)
--   - 0 < stock_quantity <= min_stock: "Sắp hết" (Badge Vàng/Cam)
--   - stock_quantity > min_stock: "Còn hàng" (Badge Xanh lá)
-- ==============================================================================

ALTER TABLE `products`
  ADD COLUMN `min_stock` INT UNSIGNED NOT NULL DEFAULT 5 COMMENT 'Ngưỡng tồn kho tối thiểu để cảnh báo nhập hàng'
  AFTER `stock_quantity`;

-- Thiết lập giá trị min_stock mẫu hợp lý cho các sản phẩm đã có sẵn:
-- id 1: iPhone 15 Pro Max 256GB (stock 15) -> min_stock = 5 (Còn hàng, an toàn)
UPDATE `products` SET `min_stock` = 5 WHERE `id` = 1;

-- id 2: Laptop ASUS ROG Zephyrus G16 (stock 8) -> min_stock = 10 (Sắp hết hàng, cần nhập thêm)
UPDATE `products` SET `min_stock` = 10 WHERE `id` = 2;

-- id 3: Tai nghe Sony WH-1000XM5 (stock 20) -> min_stock = 5 (Còn hàng)
UPDATE `products` SET `min_stock` = 5 WHERE `id` = 3;

-- id 4: Chuột Logitech MX Master 3S (stock 35) -> min_stock = 10 (Còn hàng)
UPDATE `products` SET `min_stock` = 10 WHERE `id` = 4;

-- id 5: Samsung Galaxy S24 Ultra 512GB (stock 12) -> min_stock = 5 (Còn hàng)
UPDATE `products` SET `min_stock` = 5 WHERE `id` = 5;


-- ==============================================================================
-- 2. BẢNG USERS: Mở rộng 4 vai trò (Roles), bổ sung phòng ban & thời gian đăng nhập
-- Quy trình đổi ENUM an toàn 2 bước:
--   Bước 2.1: Bổ sung cột department và last_login_at
--   Bước 2.2: Mở rộng ENUM chứa cả giá trị cũ ('admin', 'staff') và mới ('super_admin', 'manager', 'editor', 'viewer')
--   Bước 2.3: Chuyển đổi dữ liệu cũ sang vai trò mới & cập nhật thông tin email/department
--   Bước 2.4: Thu hẹp ENUM chỉ còn đúng 4 vai trò chuẩn
--   Bước 2.5: Thêm 2 tài khoản mẫu mới (Manager, Viewer)
-- ==============================================================================

-- Bước 2.1: Thêm cột department và last_login_at
ALTER TABLE `users`
  ADD COLUMN `department` VARCHAR(100) NULL COMMENT 'Phòng ban làm việc' AFTER `role`,
  ADD COLUMN `last_login_at` DATETIME NULL COMMENT 'Thời điểm đăng nhập gần nhất' AFTER `status`;

-- Bước 2.2: Mở rộng ENUM (chứa cả cũ lẫn mới để tránh mất dữ liệu hoặc lỗi truncate khi ALTER)
ALTER TABLE `users`
  MODIFY COLUMN `role` ENUM('admin', 'staff', 'super_admin', 'manager', 'editor', 'viewer') NOT NULL DEFAULT 'viewer' COMMENT 'Phân quyền người dùng';

-- Bước 2.3: Migrate dữ liệu cũ sang vai trò mới & cập nhật thông tin tài khoản có sẵn
UPDATE `users` SET
  `full_name` = 'Nguyễn Văn Admin',
  `email` = 'admin@yuwa.vn',
  `role` = 'super_admin',
  `department` = 'Ban Giám Đốc',
  `last_login_at` = '2026-09-22 12:45:03'
WHERE `id` = 1;

UPDATE `users` SET
  `full_name` = 'Lê Văn Editor',
  `email` = 'editor@yuwa.vn',
  `role` = 'editor',
  `department` = 'Marketing',
  `last_login_at` = '2026-09-21 17:30:00'
WHERE `id` = 2;

-- Dự phòng: Nếu có bản ghi nào khác còn giữ giá trị cũ thì map sang vai trò tương đương
UPDATE `users` SET `role` = 'super_admin' WHERE `role` = 'admin';
UPDATE `users` SET `role` = 'editor' WHERE `role` = 'staff';

-- Bước 2.4: Thu hẹp ENUM về đúng 4 vai trò theo chuẩn giao diện Staff & roles
ALTER TABLE `users`
  MODIFY COLUMN `role` ENUM('super_admin', 'manager', 'editor', 'viewer') NOT NULL DEFAULT 'viewer' COMMENT 'super_admin: Toàn quyền, manager: Quản lý kinh doanh/kho, editor: Biên tập nội dung/kho, viewer: Chỉ xem báo cáo';

-- Bước 2.5: Thêm 2 tài khoản mẫu mới (Trần Thị Manager & Phạm Thị Viewer)
-- Mật khẩu mặc định: 123456 (dùng chuỗi hash bcrypt tương thích $2y$10$wN9aE6k7vV4h3T0.sDfqbeA0oT0P749FkE0h4Ff/7dG1sW.i3u.9e)
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `department`, `status`, `last_login_at`, `created_at`) VALUES
(3, 'Trần Thị Manager', 'manager@yuwa.vn', '$2y$10$wN9aE6k7vV4h3T0.sDfqbeA0oT0P749FkE0h4Ff/7dG1sW.i3u.9e', 'manager', 'Kinh doanh', 1, '2026-09-22 09:12:00', '2024-03-15 08:30:00'),
(4, 'Phạm Thị Viewer', 'viewer@yuwa.vn', '$2y$10$wN9aE6k7vV4h3T0.sDfqbeA0oT0P749FkE0h4Ff/7dG1sW.i3u.9e', 'viewer', 'Kế toán', 0, '2026-09-19 08:05:00', '2024-07-10 14:00:00')
ON DUPLICATE KEY UPDATE
  `full_name` = VALUES(`full_name`),
  `role` = VALUES(`role`),
  `department` = VALUES(`department`),
  `status` = VALUES(`status`),
  `last_login_at` = VALUES(`last_login_at`);


-- ==============================================================================
-- 3. BẢNG PROMOTIONS: Quản lý mã giảm giá & Khóa ngoại trong Orders
-- Quản lý các loại khuyến mãi: Giảm %, Giảm tiền cố định, Miễn phí vận chuyển
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `promotions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã voucher (VD: SALE10, FREESHIP)',
  `discount_type` ENUM('percent', 'amount', 'freeship') NOT NULL DEFAULT 'percent' COMMENT 'percent: Giảm %, amount: Giảm số tiền, freeship: Miễn phí ship',
  `discount_value` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giá trị giảm (VD: 10 cho 10%, 200000 cho 200.000đ, 0 cho freeship)',
  `min_order_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giá trị đơn hàng tối thiểu để áp dụng mã',
  `usage_limit` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Giới hạn tổng lượt sử dụng (NULL = Không giới hạn)',
  `used_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Số lượt đã sử dụng thực tế',
  `start_date` DATE NOT NULL COMMENT 'Ngày bắt đầu áp dụng',
  `expiry_date` DATE NOT NULL COMMENT 'Ngày hết hạn áp dụng',
  `status` ENUM('active', 'paused', 'expired') NOT NULL DEFAULT 'active' COMMENT 'active: Đang chạy, paused: Tạm dừng, expired: Đã kết thúc',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý mã giảm giá và chương trình khuyến mãi';

-- Thêm cột promotion_id và khóa ngoại vào bảng orders để lưu vết mã đã áp dụng cho đơn hàng
ALTER TABLE `orders`
  ADD COLUMN `promotion_id` INT UNSIGNED NULL COMMENT 'Mã khuyến mãi áp dụng (FK -> promotions)' AFTER `customer_id`;

ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Dữ liệu mẫu 5 mã giảm giá demo đúng theo giao diện Promotions:
INSERT INTO `promotions` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `usage_limit`, `used_count`, `start_date`, `expiry_date`, `status`, `created_at`) VALUES
(1, 'SALE10', 'percent', 10.00, 500000.00, 500, 248, '2026-01-01', '2026-12-31', 'active', '2026-01-01 08:00:00'),
(2, 'FREESHIP', 'freeship', 0.00, 300000.00, 1000, 892, '2026-01-01', '2026-10-15', 'active', '2026-01-01 08:00:00'),
(3, 'FLASH200K', 'amount', 200000.00, 2000000.00, 150, 150, '2026-09-01', '2026-10-05', 'expired', '2026-09-01 00:00:00'),
(4, 'NEWMEMBER', 'percent', 15.00, 0.00, NULL, 56, '2026-01-01', '2026-12-31', 'active', '2026-01-01 00:00:00'),
(5, 'SUMMER23', 'percent', 20.00, 1000000.00, 1000, 1200, '2023-06-01', '2023-08-31', 'expired', '2023-06-01 00:00:00')
ON DUPLICATE KEY UPDATE
  `discount_type` = VALUES(`discount_type`),
  `discount_value` = VALUES(`discount_value`),
  `min_order_amount` = VALUES(`min_order_amount`),
  `usage_limit` = VALUES(`usage_limit`),
  `used_count` = VALUES(`used_count`),
  `status` = VALUES(`status`);


-- ==============================================================================
-- 4. BẢNG AUDIT_LOGS: Nhật ký theo dõi hoạt động quản trị viên & nhân viên
-- Ghi nhận lịch sử thao tác: login, logout, create, update, delete, export,...
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL COMMENT 'Người dùng thực hiện (FK -> users, NULL nếu là khách/hệ thống)',
  `action` VARCHAR(50) NOT NULL COMMENT 'Hành động: login, logout, create, update, delete, export,...',
  `object_type` VARCHAR(50) NOT NULL COMMENT 'Loại đối tượng: system, products, orders, promotions, users, settings,...',
  `object_id` INT UNSIGNED NULL COMMENT 'ID của đối tượng bị tác động (nếu có)',
  `detail` TEXT NULL COMMENT 'Mô tả chi tiết nội dung thay đổi hoặc kết quả thao tác',
  `ip_address` VARCHAR(45) NULL COMMENT 'Địa chỉ IPv4/IPv6 truy cập',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng nhật ký hoạt động hệ thống quản trị';

-- Seed 5 dòng dữ liệu mẫu mô phỏng nhật ký thao tác gắn với các user_id:
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `object_type`, `object_id`, `detail`, `ip_address`, `created_at`) VALUES
(1, 1, 'login', 'system', NULL, 'Đăng nhập thành công từ Chrome 126 / Windows 11', '42.116.8.201', '2026-09-22 10:15:22'),
(2, 3, 'create', 'promotions', 1, 'Tạo mã giảm giá SALE10: 10%, hiệu lực đến 31/12/2026', '10.0.0.12', '2026-09-22 11:30:47'),
(3, 1, 'update', 'products', 1, 'Cập nhật giá từ 14,500,000₫ → 13,900,000₫', '192.168.1.5', '2026-09-22 12:45:03'),
(4, 2, 'create', 'products', 2, 'Thêm sản phẩm "Bàn phím Keychron K2 Pro" vào danh mục Phụ kiện', '192.168.1.22', '2026-09-22 09:48:11'),
(5, 1, 'delete', 'orders', 2, 'Xóa đơn hàng nháp chưa thanh toán sau 7 ngày', '192.168.1.5', '2026-09-21 17:30:05')
ON DUPLICATE KEY UPDATE
  `detail` = VALUES(`detail`),
  `ip_address` = VALUES(`ip_address`);


-- ==============================================================================
-- 5. BẢNG SETTINGS: Cấu hình hệ thống & Cửa hàng dạng Key - Value
-- Phục vụ lưu trữ cài đặt thông tin cửa hàng, thanh toán, bảo mật, giao diện
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Khóa cấu hình duy nhất',
  `setting_value` TEXT NULL COMMENT 'Giá trị cấu hình tương ứng',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng cấu hình hệ thống dạng Key-Value';

-- Seed 10 tham số cấu hình mẫu theo đúng giao diện Settings:
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('store_name', 'YuwaShop'),
('contact_email', 'hello@yuwa.vn'),
('phone', '1800 1234'),
('website', 'https://yuwa.vn'),
('address', '123 Nguyễn Văn Linh, Q.7, TP.HCM'),
('intro', 'YuwaShop — Chuyên cung cấp laptop, linh kiện, phụ kiện công nghệ chính hãng với giá tốt nhất thị trường.'),
('currency', 'VND'),
('timezone', 'UTC+7'),
('language', 'vi'),
('dark_mode', '0')
ON DUPLICATE KEY UPDATE
  `setting_value` = VALUES(`setting_value`),
  `updated_at` = CURRENT_TIMESTAMP;
