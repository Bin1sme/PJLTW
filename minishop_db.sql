-- ==============================================================================
-- CƠ SỞ DỮ LIỆU ĐỀ TÀI 01: WEBSITE BÁN THIẾT BỊ CÔNG NGHỆ (NHÓM A - E-COMMERCE & KHO)
-- Môn học: Lập trình Web - Học viện Hàng không Việt Nam
-- Chuẩn kỹ thuật bắt buộc: 12 bảng nghiệp vụ tối thiểu + Quan hệ PK/FK + Dữ liệu mẫu demo
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `minishop_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `minishop_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `stock_movements`;
DROP TABLE IF EXISTS `suppliers`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `product_images`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `brands`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 1. BẢNG TÀI KHOẢN QUẢN TRỊ & NHÂN VIÊN (Dùng cho Login Session & Phân quyền Admin/Staff)
-- ==============================================================================
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff') NOT NULL DEFAULT 'staff' COMMENT 'admin: Toàn quyền, staff: Nhân viên bán hàng & kho',
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 2. CỤM HÀNG HÓA & CATALOG (Bảng 1, 2, 3, 4)
-- ==============================================================================

-- Bảng 1: Danh mục sản phẩm (categories)
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 2: Thương hiệu (brands)
CREATE TABLE `brands` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `country` VARCHAR(80) NULL,
  `logo` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 3: Sản phẩm (products)
-- Quan hệ: 1 Category -> N Products, 1 Brand -> N Products
CREATE TABLE `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT UNSIGNED NOT NULL,
  `brand_id` INT UNSIGNED NOT NULL,
  `sku` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã sản phẩm IT',
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL UNIQUE,
  `price` DECIMAL(12, 2) NOT NULL,
  `compare_at_price` DECIMAL(12, 2) NULL COMMENT 'Giá gốc trước giảm',
  `stock_quantity` INT NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho tức thời',
  `thumbnail` VARCHAR(255) NOT NULL COMMENT 'Ảnh đại diện chính',
  `description` TEXT NULL,
  `specs` TEXT NULL COMMENT 'Thông số kỹ thuật: CPU, RAM, Ổ cứng,...',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 4: Thư viện hình ảnh sản phẩm (product_images)
-- Quan hệ: 1 Product -> N Images
CREATE TABLE `product_images` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  CONSTRAINT `fk_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 3. CỤM KHÁCH HÀNG & GIỎ HÀNG (Bảng 5, 6, 7)
-- ==============================================================================

-- Bảng 5: Khách hàng (customers)
CREATE TABLE `customers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address` VARCHAR(255) NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 6: Giỏ hàng (carts)
CREATE TABLE `carts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT UNSIGNED NULL COMMENT 'Null nếu là khách vãng lai (guest)',
  `session_id` VARCHAR(100) NULL COMMENT 'Mã session lưu tạm',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_carts_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 7: Chi tiết giỏ hàng (cart_items)
-- Quan hệ: 1 Cart -> N Cart_Items, 1 Product -> N Cart_Items
CREATE TABLE `cart_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `cart_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_cart_product` (`cart_id`, `product_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. CỤM ĐƠN HÀNG & THANH TOÁN (Bảng 8, 9, 10 - Chuỗi giao dịch bán hàng)
-- ==============================================================================

-- Bảng 8: Đơn hàng (orders)
-- Quan hệ: 1 Customer -> N Orders
CREATE TABLE `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_code` VARCHAR(30) NOT NULL UNIQUE COMMENT 'Ví dụ: ORD-20260920-001',
  `customer_id` INT UNSIGNED NOT NULL,
  `shipping_name` VARCHAR(100) NOT NULL,
  `shipping_phone` VARCHAR(20) NOT NULL,
  `shipping_address` VARCHAR(255) NOT NULL,
  `total_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
  `status` ENUM('pending', 'confirmed', 'shipping', 'completed', 'canceled') NOT NULL DEFAULT 'pending' COMMENT 'Chờ duyệt, Đã xác nhận, Đang giao, Hoàn tất, Hủy',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 9: Chi tiết đơn hàng (order_items - Bảng chi tiết giao dịch 1)
-- Quan hệ: 1 Order -> N Order_Items, 1 Product -> N Order_Items
CREATE TABLE `order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `product_name` VARCHAR(200) NOT NULL COMMENT 'Lưu cứng tên đề phòng SP gốc đổi tên',
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(12, 2) NOT NULL COMMENT 'Giá tại thời điểm mua',
  `total_price` DECIMAL(12, 2) NOT NULL,
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 10: Thanh toán (payments)
-- Quan hệ: 1 Order -> 1 hoặc N Payments
CREATE TABLE `payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `payment_method` ENUM('COD', 'BANKING', 'VNPAY', 'MOMO') NOT NULL DEFAULT 'COD',
  `amount` DECIMAL(12, 2) NOT NULL,
  `transaction_code` VARCHAR(100) NULL COMMENT 'Mã chuyển khoản hoặc mã cổng thanh toán',
  `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `paid_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 5. CỤM QUẢN LÝ KHO & NHẬP XUẤT (Bảng 11, 12 - Chuỗi kho nghiệp vụ)
-- ==============================================================================

-- Bảng 11: Nhà cung cấp thiết bị IT (suppliers)
CREATE TABLE `suppliers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL COMMENT 'VD: FPT Synnex, Digiworld, Dầu Khí PSD',
  `contact_name` VARCHAR(100) NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NULL,
  `address` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 12: Biến động tồn kho (stock_movements - Bảng chi tiết giao dịch 2)
-- Quan hệ: 1 Product -> N Stock_Movements, 1 Supplier -> N Stock_Movements
CREATE TABLE `stock_movements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `supplier_id` INT UNSIGNED NULL COMMENT 'Có giá trị khi là phiếu nhập kho từ nhà cung cấp',
  `movement_type` ENUM('IN', 'OUT', 'RETURN', 'ADJUST') NOT NULL COMMENT 'IN: Nhập hàng, OUT: Xuất bán, RETURN: Khách trả, ADJUST: Kiểm kê bù trừ',
  `quantity` INT NOT NULL COMMENT 'Dương (+) khi tăng kho, Âm (-) khi giảm kho',
  `unit_price` DECIMAL(12, 2) NULL COMMENT 'Giá nhập hoặc giá xuất',
  `reference_code` VARCHAR(50) NULL COMMENT 'Mã phiếu nhập (PN-xxx) hoặc mã đơn hàng (ORD-xxx)',
  `note` VARCHAR(255) NULL COMMENT 'Ghi chú lý do biến động',
  `created_by` VARCHAR(100) NULL COMMENT 'Người tạo phiếu (Admin/Nhân viên kho)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_stock_movements_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_stock_movements_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==============================================================================
-- DỮ LIỆU MẪU ĐẦY ĐỦ (SEED DATA) ĐỂ DEMO NGAY LẬP TỨC
-- ==============================================================================

-- Tài khoản quản trị và nhân viên (Mật khẩu mặc định: 123456 - dùng password_hash chuẩn)
-- Hash bên dưới tương ứng với chuỗi '123456'
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`) VALUES
(1, 'Quản Trị Viên', 'admin@minishop.local', '$2y$10$wN9aE6k7vV4h3T0.sDfqbeA0oT0P749FkE0h4Ff/7dG1sW.i3u.9e', 'admin'),
(2, 'Nhân Viên Bán Hàng', 'staff@minishop.local', '$2y$10$wN9aE6k7vV4h3T0.sDfqbeA0oT0P749FkE0h4Ff/7dG1sW.i3u.9e', 'staff');

-- Danh mục sản phẩm công nghệ
INSERT INTO `categories` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Điện thoại thông minh', 'dien-thoai', 'Điện thoại chính hãng Apple, Samsung, Xiaomi'),
(2, 'Laptop & Máy tính', 'laptop', 'Laptop Gaming, Văn phòng cao cấp'),
(3, 'Thiết bị âm thanh', 'am-thanh', 'Tai nghe bluetooth, loa không dây chất âm đỉnh cao'),
(4, 'Phụ kiện công nghệ', 'phu-kien', 'Củ cáp sạc, chuột không dây, bàn phím cơ');

-- Thương hiệu
INSERT INTO `brands` (`id`, `name`, `slug`, `country`, `logo`) VALUES
(1, 'Apple', 'apple', 'Mỹ', 'apple.png'),
(2, 'ASUS', 'asus', 'Đài Loan', 'asus.png'),
(3, 'Sony', 'sony', 'Nhật Bản', 'sony.png'),
(4, 'Logitech', 'logitech', 'Thụy Sĩ', 'logitech.png'),
(5, 'Samsung', 'samsung', 'Hàn Quốc', 'samsung.png');

-- Nhà cung cấp thiết bị IT
INSERT INTO `suppliers` (`id`, `name`, `contact_name`, `phone`, `email`, `address`) VALUES
(1, 'FPT Synnex Phân Phối', 'Nguyễn Văn Long', '02873001010', 'contact@synnexfpt.com.vn', 'Quận 7, TP. Hồ Chí Minh'),
(2, 'Digiworld Corporation (DGW)', 'Trần Thị Mai', '02839290059', 'info@digiworld.com.vn', 'Quận 3, TP. Hồ Chí Minh'),
(3, 'Dầu Khí PSD', 'Lê Hoàng Nam', '02839115577', 'kinhdoanh@psd.com.vn', 'Quận 1, TP. Hồ Chí Minh');

-- Sản phẩm IT
INSERT INTO `products` (`id`, `category_id`, `brand_id`, `sku`, `name`, `slug`, `price`, `compare_at_price`, `stock_quantity`, `thumbnail`, `description`, `specs`) VALUES
(1, 1, 1, 'IP15PM-256', 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 28990000, 31990000, 15, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80', 'Khung Titan siêu bền nhẹ, Chip A17 Pro mạnh mẽ bậc nhất.', 'Màn hình 6.7 inch OLED 120Hz, Chip A17 Pro, RAM 8GB, Bộ nhớ 256GB'),
(2, 2, 2, 'ROG-ZEPH-G16', 'Laptop ASUS ROG Zephyrus G16', 'laptop-asus-rog-zephyrus-g16', 31990000, 34990000, 8, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', 'Laptop gaming mỏng nhẹ màn hình OLED 2.5K 240Hz sắc nét đỉnh cao.', 'Core Ultra 7, RTX 4060 8GB, RAM 16GB LPDDR5X, SSD 1TB PCIe 4.0'),
(3, 3, 3, 'WH-1000XM5', 'Tai nghe chống ồn Sony WH-1000XM5', 'tai-nghe-sony-wh-1000xm5', 6490000, 7990000, 20, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80', 'Công nghệ chống ồn chủ động hàng đầu ngành, thời lượng pin 30 giờ.', 'Driver 30mm, Chống ồn V1+QN1, Pin 30h, Sạc nhanh Type-C'),
(4, 4, 4, 'MX-MASTER-3S', 'Chuột không dây Logitech MX Master 3S', 'chuot-logitech-mx-master-3s', 2190000, 2490000, 35, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80', 'Cảm biến 8000 DPI trên mọi bề mặt, nút bấm yên tĩnh Quiet Clicks.', 'Cảm biến Darkfield 8000 DPI, Con cuộn MagSpeed điện từ, Kết nối 3 thiết bị'),
(5, 1, 5, 'SS-S24U-512', 'Samsung Galaxy S24 Ultra 512GB', 'samsung-galaxy-s24-ultra', 26990000, 30990000, 12, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80', 'Quyền năng Galaxy AI, Bút S-Pen tiện ích, Khung viền Titan.', 'Dynamic AMOLED 2X 6.8 inch, Snapdragon 8 Gen 3 for Galaxy, RAM 12GB');

-- Thư viện ảnh sản phẩm (product_images)
INSERT INTO `product_images` (`product_id`, `image_url`, `is_primary`, `sort_order`) VALUES
(1, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80', 1, 1),
(1, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80', 0, 2),
(2, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', 1, 1),
(3, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80', 1, 1),
(4, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80', 1, 1);

-- Khách hàng mẫu
INSERT INTO `customers` (`id`, `full_name`, `email`, `password`, `phone`, `address`) VALUES
(1, 'Nguyễn Văn An', 'nguyenan@gmail.com', '$2y$10$wN9aE6k7vV4h3T0.sDfqbeA0oT0P749FkE0h4Ff/7dG1sW.i3u.9e', '0901234567', 'Số 123 Lê Lợi, Quận 1, TP.HCM'),
(2, 'Trần Minh Hoàng', 'hoangtran@gmail.com', '$2y$10$wN9aE6k7vV4h3T0.sDfqbeA0oT0P749FkE0h4Ff/7dG1sW.i3u.9e', '0918765432', 'Số 45 Quang Trung, Gò Vấp, TP.HCM');

-- Giỏ hàng & chi tiết giỏ hàng của khách hàng 1
INSERT INTO `carts` (`id`, `customer_id`, `session_id`) VALUES
(1, 1, 'sess_demo_12345');

INSERT INTO `cart_items` (`cart_id`, `product_id`, `quantity`) VALUES
(1, 4, 1); -- Đang để 1 chuột Logitech trong giỏ

-- Đơn hàng mẫu
INSERT INTO `orders` (`id`, `order_code`, `customer_id`, `shipping_name`, `shipping_phone`, `shipping_address`, `total_amount`, `status`, `notes`) VALUES
(1, 'ORD-20260901-001', 1, 'Nguyễn Văn An', '0901234567', 'Số 123 Lê Lợi, Quận 1, TP.HCM', 28990000, 'completed', 'Giao trong giờ hành chính'),
(2, 'ORD-20260910-002', 2, 'Trần Minh Hoàng', '0918765432', 'Số 45 Quang Trung, Gò Vấp, TP.HCM', 8680000, 'confirmed', 'Gọi trước khi giao hàng');

-- Chi tiết đơn hàng (order_items)
INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `total_price`) VALUES
(1, 1, 'iPhone 15 Pro Max 256GB', 1, 28990000, 28990000),
(2, 3, 'Tai nghe chống ồn Sony WH-1000XM5', 1, 6490000, 6490000),
(2, 4, 'Chuột không dây Logitech MX Master 3S', 1, 2190000, 2190000);

-- Thanh toán đơn hàng (payments)
INSERT INTO `payments` (`order_id`, `payment_method`, `amount`, `transaction_code`, `status`, `paid_at`) VALUES
(1, 'BANKING', 28990000, 'VCB99882211', 'completed', '2026-09-01 10:30:00'),
(2, 'COD', 8680000, NULL, 'pending', NULL);

-- Lịch sử biến động kho (stock_movements: Nhập hàng từ NCC & Xuất bán cho đơn hàng)
INSERT INTO `stock_movements` (`product_id`, `supplier_id`, `movement_type`, `quantity`, `unit_price`, `reference_code`, `note`, `created_by`) VALUES
-- Nhập kho ban đầu từ FPT Synnex
(1, 1, 'IN', 16, 25000000, 'PN-20260825-01', 'Nhập lô iPhone 15 Pro Max đợt 1', 'Admin'),
(2, 2, 'IN', 8, 28000000, 'PN-20260825-02', 'Nhập laptop Asus ROG từ Digiworld', 'Admin'),
(3, 3, 'IN', 21, 5500000, 'PN-20260826-01', 'Nhập tai nghe Sony từ PSD', 'Admin'),
(4, 3, 'IN', 36, 1750000, 'PN-20260826-02', 'Nhập chuột Logitech từ PSD', 'Admin'),
-- Xuất bán cho đơn hàng #1 (iPhone 15 PM trừ 1 cái: 16 - 1 = 15 cái)
(1, NULL, 'OUT', -1, 28990000, 'ORD-20260901-001', 'Xuất bán cho đơn hàng ORD-20260901-001', 'Hệ thống tự động'),
-- Xuất bán cho đơn hàng #2 (Sony trừ 1: 21 - 1 = 20, Logitech trừ 1: 36 - 1 = 35)
(3, NULL, 'OUT', -1, 6490000, 'ORD-20260910-002', 'Xuất bán cho đơn hàng ORD-20260910-002', 'Hệ thống tự động'),
(4, NULL, 'OUT', -1, 2190000, 'ORD-20260910-002', 'Xuất bán cho đơn hàng ORD-20260910-002', 'Hệ thống tự động');
