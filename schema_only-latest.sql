-- MySQL dump 10.13  Distrib 9.3.0, for macos14.7 (x86_64)
--
-- Host: localhost    Database: usmanhardware_latest
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `uh_ims_account_balances`
--

DROP TABLE IF EXISTS `uh_ims_account_balances`;
/*!50001 DROP VIEW IF EXISTS `uh_ims_account_balances`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `uh_ims_account_balances` AS SELECT 
 1 AS `id`,
 1 AS `account_code`,
 1 AS `account_name`,
 1 AS `account_type`,
 1 AS `is_active`,
 1 AS `created_at`,
 1 AS `balance`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `uh_ims_accounts`
--

DROP TABLE IF EXISTS `uh_ims_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_type` enum('asset','liability','equity','revenue','expense','bank','cash') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_code` (`account_code`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_audit_logs`
--

DROP TABLE IF EXISTS `uh_ims_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` bigint DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_table_record` (`table_name`,`record_id`),
  KEY `idx_audit_user_date` (`user_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_budgets`
--

DROP TABLE IF EXISTS `uh_ims_budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_budgets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `budget_amount` decimal(10,2) NOT NULL,
  `actual_amount` decimal(10,2) DEFAULT '0.00',
  `variance` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_budget` (`year`,`month`,`category`),
  KEY `idx_budget_year_month` (`year`,`month`),
  KEY `idx_budget_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_cash_flow`
--

DROP TABLE IF EXISTS `uh_ims_cash_flow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_cash_flow` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` enum('inflow','outflow') COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` bigint DEFAULT NULL,
  `transaction_id` bigint DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cashflow_date_type` (`date`,`type`),
  KEY `idx_cashflow_account_date` (`account_id`,`date`),
  KEY `fk_cashflow_transaction` (`transaction_id`),
  CONSTRAINT `fk_cashflow_account` FOREIGN KEY (`account_id`) REFERENCES `uh_ims_accounts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cashflow_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `uh_ims_transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1163 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_categories`
--

DROP TABLE IF EXISTS `uh_ims_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_categories_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_customers`
--

DROP TABLE IF EXISTS `uh_ims_customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('Temporary','Semi-Permanent','Permanent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Permanent',
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `credit_limit` decimal(15,2) DEFAULT '0.00',
  `current_balance` decimal(15,2) DEFAULT '0.00',
  `total_purchases` decimal(15,2) DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `unique_customer_combo` (`name`,`phone`,`email`),
  KEY `idx_customers_name` (`name`),
  KEY `idx_customers_phone` (`phone`),
  KEY `idx_customers_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=656 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_employees`
--

DROP TABLE IF EXISTS `uh_ims_employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `salary` decimal(12,2) DEFAULT '0.00',
  `join_date` date NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_emp_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_events`
--

DROP TABLE IF EXISTS `uh_ims_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('call','delivery','payment','meeting') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `customer_id` bigint DEFAULT NULL,
  `priority` enum('low','medium','high') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `status` enum('scheduled','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  `reminder` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `fk_events_customer` FOREIGN KEY (`customer_id`) REFERENCES `uh_ims_customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_expenses`
--

DROP TABLE IF EXISTS `uh_ims_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_expenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` bigint DEFAULT NULL,
  `transaction_id` bigint DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` enum('cash','bank_transfer','cheque') COLLATE utf8mb4_unicode_ci NOT NULL,
  `receipt_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_expenses_date_category` (`date`,`category`),
  KEY `idx_expenses_account_date` (`account_id`,`date`),
  KEY `fk_expenses_transaction` (`transaction_id`),
  KEY `fk_expenses_created_by` (`created_by`),
  CONSTRAINT `fk_expenses_account` FOREIGN KEY (`account_id`) REFERENCES `uh_ims_accounts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenses_created_by` FOREIGN KEY (`created_by`) REFERENCES `uh_ims_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenses_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `uh_ims_transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_external_purchases`
--

DROP TABLE IF EXISTS `uh_ims_external_purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_external_purchases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sale_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `source` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sale_id` (`sale_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `fk_external_product` FOREIGN KEY (`product_id`) REFERENCES `uh_ims_products` (`id`),
  CONSTRAINT `fk_external_sale` FOREIGN KEY (`sale_id`) REFERENCES `uh_ims_sales` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_inventory_movements`
--

DROP TABLE IF EXISTS `uh_ims_inventory_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_inventory_movements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `type` enum('sale','purchase','adjustment','return','damage') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `balance_before` decimal(10,2) NOT NULL,
  `balance_after` decimal(10,2) NOT NULL,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sale_id` bigint DEFAULT NULL,
  `condition` enum('good','damaged') COLLATE utf8mb4_unicode_ci DEFAULT 'good',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `idx_inventory_movements_sale` (`sale_id`),
  KEY `idx_movements_product_date` (`product_id`,`created_at`),
  KEY `idx_inventory_product_type_date` (`product_id`,`type`,`created_at`),
  KEY `idx_inventory_product_date` (`product_id`,`created_at`),
  CONSTRAINT `fk_movements_sale` FOREIGN KEY (`sale_id`) REFERENCES `uh_ims_sales` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4854 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_notifications`
--

DROP TABLE IF EXISTS `uh_ims_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` enum('stock','payment','order','general') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_id` bigint DEFAULT NULL,
  `related_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_type_read` (`type`,`is_read`),
  KEY `idx_notif_related` (`related_type`,`related_id`),
  KEY `idx_notif_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_outsourcing_orders`
--

DROP TABLE IF EXISTS `uh_ims_outsourcing_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_outsourcing_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sale_id` bigint NOT NULL,
  `sale_item_id` bigint DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `supplier_id` bigint NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `cost_per_unit` decimal(12,2) NOT NULL,
  `total_cost` decimal(12,2) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','ordered','delivered','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sale_id` (`sale_id`),
  KEY `product_id` (`product_id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `fk_outsourcing_product` FOREIGN KEY (`product_id`) REFERENCES `uh_ims_products` (`id`),
  CONSTRAINT `fk_outsourcing_sale` FOREIGN KEY (`sale_id`) REFERENCES `uh_ims_sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_outsourcing_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `uh_ims_suppliers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_payment_allocations`
--

DROP TABLE IF EXISTS `uh_ims_payment_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_payment_allocations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `payment_id` bigint NOT NULL,
  `invoice_id` bigint NOT NULL,
  `invoice_type` enum('sale','purchase') COLLATE utf8mb4_unicode_ci NOT NULL,
  `allocated_amount` decimal(10,2) NOT NULL,
  `allocation_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`,`invoice_type`),
  KEY `idx_allocation_invoice` (`invoice_id`,`invoice_type`),
  KEY `idx_allocation_payment` (`payment_id`),
  CONSTRAINT `fk_allocation_payment` FOREIGN KEY (`payment_id`) REFERENCES `uh_ims_payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_payment_terms`
--

DROP TABLE IF EXISTS `uh_ims_payment_terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_payment_terms` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `days` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_payments`
--

DROP TABLE IF EXISTS `uh_ims_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint DEFAULT NULL,
  `transaction_id` bigint DEFAULT NULL,
  `account_id` bigint DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_method` enum('cash','bank_transfer','cheque') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_type` enum('receipt','payment') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'receipt',
  `status` enum('pending','cleared','bounced') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_payments_customer_date_status` (`customer_id`,`date`,`status`),
  KEY `fk_payments_transaction` (`transaction_id`),
  KEY `fk_payments_account` (`account_id`),
  KEY `idx_payments_deleted` (`deleted_at`),
  KEY `idx_payments_date_customer` (`date`,`customer_id`),
  KEY `idx_payments_reference` (`reference`),
  CONSTRAINT `fk_payments_account` FOREIGN KEY (`account_id`) REFERENCES `uh_ims_accounts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payments_customer` FOREIGN KEY (`customer_id`) REFERENCES `uh_ims_customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payments_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `uh_ims_transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=226 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_product_images`
--

DROP TABLE IF EXISTS `uh_ims_product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_product_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `uh_ims_products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_product_variants`
--

DROP TABLE IF EXISTS `uh_ims_product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_product_variants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned DEFAULT NULL,
  `attribute_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attribute_value` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sku_suffix` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_adjustment` decimal(10,2) DEFAULT NULL,
  `stock` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_products`
--

DROP TABLE IF EXISTS `uh_ims_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `cost_price` decimal(15,2) NOT NULL,
  `stock` decimal(10,2) NOT NULL DEFAULT '0.00',
  `min_stock` decimal(10,2) NOT NULL DEFAULT '0.00',
  `max_stock` decimal(10,2) NOT NULL DEFAULT '100.00',
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `supplier_id` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `category_id` (`category_id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `idx_products_cost` (`id`,`cost_price`),
  KEY `idx_id` (`id`),
  KEY `idx_products_stock_status` (`stock`,`status`),
  KEY `idx_products_category_status` (`category_id`,`status`),
  KEY `idx_deleted_at` (`deleted_at`),
  KEY `idx_products_name` (`name`),
  KEY `idx_products_sku` (`sku`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `uh_ims_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `uh_ims_suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=296 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_profit_summary`
--

DROP TABLE IF EXISTS `uh_ims_profit_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_profit_summary` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `period_date` date NOT NULL,
  `period_type` enum('daily','weekly','monthly') COLLATE utf8mb4_unicode_ci NOT NULL,
  `revenue` decimal(10,2) DEFAULT '0.00',
  `cogs` decimal(10,2) DEFAULT '0.00',
  `expenses` decimal(10,2) DEFAULT '0.00',
  `profit` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_profit_period` (`period_date`,`period_type`),
  KEY `idx_profit_date` (`period_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_purchase_order_items`
--

DROP TABLE IF EXISTS `uh_ims_purchase_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_purchase_order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `purchase_order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `quantity_received` decimal(10,2) DEFAULT '0.00',
  `item_condition` enum('good','damaged') COLLATE utf8mb4_unicode_ci DEFAULT 'good',
  PRIMARY KEY (`id`),
  KEY `purchase_order_id` (`purchase_order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `fk_po_items_order` FOREIGN KEY (`purchase_order_id`) REFERENCES `uh_ims_purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_po_items_product` FOREIGN KEY (`product_id`) REFERENCES `uh_ims_products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_purchase_orders`
--

DROP TABLE IF EXISTS `uh_ims_purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_purchase_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` bigint DEFAULT NULL,
  `date` date NOT NULL,
  `expected_delivery` date DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `status` enum('draft','sent','confirmed','received','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `supplier_id` (`supplier_id`),
  KEY `idx_po_status_date` (`status`,`date`),
  KEY `idx_po_supplier_status` (`supplier_id`,`status`),
  KEY `fk_po_created_by` (`created_by`),
  KEY `idx_po_order_number` (`order_number`),
  CONSTRAINT `fk_po_created_by` FOREIGN KEY (`created_by`) REFERENCES `uh_ims_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `uh_ims_suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_quotation_items`
--

DROP TABLE IF EXISTS `uh_ims_quotation_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_quotation_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quotation_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `quotation_id` (`quotation_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `fk_quotation_items_product` FOREIGN KEY (`product_id`) REFERENCES `uh_ims_products` (`id`),
  CONSTRAINT `fk_quotation_items_quotation` FOREIGN KEY (`quotation_id`) REFERENCES `uh_ims_quotations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_quotations`
--

DROP TABLE IF EXISTS `uh_ims_quotations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_quotations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quote_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint DEFAULT NULL,
  `date` date NOT NULL,
  `valid_until` date NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `tax` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `status` enum('draft','sent','accepted','rejected','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quote_number` (`quote_number`),
  KEY `customer_id` (`customer_id`),
  KEY `fk_quotations_created_by` (`created_by`),
  CONSTRAINT `fk_quotations_created_by` FOREIGN KEY (`created_by`) REFERENCES `uh_ims_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_quotations_customer` FOREIGN KEY (`customer_id`) REFERENCES `uh_ims_customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_sale_adjustment_items`
--

DROP TABLE IF EXISTS `uh_ims_sale_adjustment_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_sale_adjustment_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adjustment_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `restocked` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `idx_adjustment_items_adjustment` (`adjustment_id`),
  KEY `idx_adjustment_items_product` (`product_id`),
  CONSTRAINT `fk_adjustment_items_adjustment` FOREIGN KEY (`adjustment_id`) REFERENCES `uh_ims_sale_adjustments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_items_product` FOREIGN KEY (`product_id`) REFERENCES `uh_ims_products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=192 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_sale_adjustments`
--

DROP TABLE IF EXISTS `uh_ims_sale_adjustments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_sale_adjustments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sale_id` bigint NOT NULL,
  `type` enum('return','full_reversal') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `refund_amount` decimal(10,2) DEFAULT '0.00',
  `restock_items` tinyint(1) DEFAULT '0',
  `processed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_adjustments_sale` (`sale_id`),
  KEY `idx_adjustments_type` (`type`),
  CONSTRAINT `fk_adjustment_sale` FOREIGN KEY (`sale_id`) REFERENCES `uh_ims_sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_sale_items`
--

DROP TABLE IF EXISTS `uh_ims_sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_sale_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sale_id` bigint DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `total` decimal(15,2) NOT NULL,
  `is_outsourced` tinyint(1) NOT NULL DEFAULT '0',
  `outsourcing_supplier_id` bigint DEFAULT NULL,
  `outsourcing_cost_per_unit` decimal(10,2) DEFAULT NULL,
  `return_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sale_id` (`sale_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_sale_items_return` (`return_id`),
  KEY `idx_outsourcing_supplier` (`outsourcing_supplier_id`),
  KEY `idx_sale_items_profit` (`sale_id`,`product_id`),
  KEY `idx_sale_id` (`sale_id`),
  KEY `idx_sale_items_sale_product` (`sale_id`,`product_id`),
  CONSTRAINT `fk_sale_items_product` FOREIGN KEY (`product_id`) REFERENCES `uh_ims_products` (`id`),
  CONSTRAINT `fk_sale_items_return` FOREIGN KEY (`return_id`) REFERENCES `uh_ims_sale_adjustments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`sale_id`) REFERENCES `uh_ims_sales` (`id`),
  CONSTRAINT `fk_sale_items_supplier` FOREIGN KEY (`outsourcing_supplier_id`) REFERENCES `uh_ims_suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4254 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_sales`
--

DROP TABLE IF EXISTS `uh_ims_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_sales` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint DEFAULT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `discount` decimal(15,2) DEFAULT '0.00',
  `total` decimal(15,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `cancel_reason` text COLLATE utf8mb4_unicode_ci,
  `payment_method` enum('cash','credit','bank_transfer','cheque') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_sales_status_date` (`status`,`date`),
  KEY `idx_date_status` (`date`,`status`),
  KEY `idx_sales_date_status` (`date`,`status`),
  KEY `idx_sales_customer_date` (`customer_id`,`date`),
  KEY `idx_sales_payment_status` (`payment_method`,`status`),
  KEY `idx_sales_customer_status_date` (`customer_id`,`status`,`date`),
  KEY `idx_sales_deleted` (`deleted_at`),
  KEY `fk_sales_created_by` (`created_by`),
  KEY `idx_sales_date_status_total` (`date`,`status`,`total`),
  KEY `idx_sales_order_number` (`order_number`),
  KEY `idx_sales_date_payment_status` (`date`,`payment_method`,`status`),
  CONSTRAINT `fk_sales_created_by` FOREIGN KEY (`created_by`) REFERENCES `uh_ims_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sales_customer` FOREIGN KEY (`customer_id`) REFERENCES `uh_ims_customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2361 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_scheduled_expenses`
--

DROP TABLE IF EXISTS `uh_ims_scheduled_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_scheduled_expenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `amount` decimal(10,2) NOT NULL,
  `frequency` enum('daily','weekly','monthly','yearly') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `next_execution` date NOT NULL,
  `status` enum('active','paused','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `account_id` bigint DEFAULT NULL,
  `payment_method` enum('cash','bank_transfer','cheque') COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_executed` date DEFAULT NULL,
  `execution_count` int DEFAULT '0',
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_schedexp_account` (`account_id`),
  KEY `fk_schedexp_user` (`created_by`),
  CONSTRAINT `fk_schedexp_account` FOREIGN KEY (`account_id`) REFERENCES `uh_ims_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_sessions`
--

DROP TABLE IF EXISTS `uh_ims_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_sessions` (
  `id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `device_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payload` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Encrypted session data',
  `last_activity` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session_user` (`user_id`),
  KEY `idx_session_expiry` (`expires_at`),
  KEY `idx_session_last_activity` (`last_activity`),
  CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `uh_ims_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User sessions for tracking and security';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_supplier_payments`
--

DROP TABLE IF EXISTS `uh_ims_supplier_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_supplier_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','bank_transfer','cheque') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `date` date NOT NULL,
  `status` enum('pending','cleared','bounced') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `fk_supplier_payment_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `uh_ims_suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_suppliers`
--

DROP TABLE IF EXISTS `uh_ims_suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_suppliers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `total_purchases` decimal(10,2) DEFAULT '0.00',
  `pending_payments` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_suppliers_deleted` (`deleted_at`),
  KEY `idx_suppliers_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_transaction_entries`
--

DROP TABLE IF EXISTS `uh_ims_transaction_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_transaction_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint NOT NULL,
  `account_id` bigint NOT NULL,
  `entry_type` enum('debit','credit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_id` (`transaction_id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `uh_ims_transaction_entries_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `uh_ims_transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `uh_ims_transaction_entries_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `uh_ims_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_transactions`
--

DROP TABLE IF EXISTS `uh_ims_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `transaction_date` date NOT NULL,
  `transaction_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `reference_type` enum('sale','purchase','payment','expense','adjustment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_number` (`transaction_number`),
  KEY `transaction_date` (`transaction_date`),
  KEY `reference_type` (`reference_type`,`reference_id`)
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_units`
--

DROP TABLE IF EXISTS `uh_ims_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_units` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_units_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_user_activities`
--

DROP TABLE IF EXISTS `uh_ims_user_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_user_activities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., login, create_sale, update_product',
  `module` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Module/feature where action occurred',
  `details` json DEFAULT NULL COMMENT 'Action-specific details in JSON format',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_user` (`user_id`),
  KEY `idx_activity_date` (`created_at`),
  KEY `idx_activity_action` (`action`),
  KEY `idx_activity_module` (`module`),
  CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `uh_ims_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User activity log for audit trail';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uh_ims_users`
--

DROP TABLE IF EXISTS `uh_ims_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uh_ims_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','manager','staff','viewer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'staff',
  `permissions` json DEFAULT NULL COMMENT 'Additional permissions beyond role',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `failed_attempts` int DEFAULT '0',
  `locked_until` datetime DEFAULT NULL,
  `password_changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_role_active` (`role`,`is_active`),
  KEY `idx_user_last_login` (`last_login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User authentication and basic info';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `uh_ims_account_balances`
--

/*!50001 DROP VIEW IF EXISTS `uh_ims_account_balances`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `uh_ims_account_balances` AS select `a`.`id` AS `id`,`a`.`account_code` AS `account_code`,`a`.`account_name` AS `account_name`,`a`.`account_type` AS `account_type`,`a`.`is_active` AS `is_active`,`a`.`created_at` AS `created_at`,coalesce(sum((case when (`cf`.`type` = 'inflow') then `cf`.`amount` else -(`cf`.`amount`) end)),0) AS `balance` from (`uh_ims_accounts` `a` left join `uh_ims_cash_flow` `cf` on((`a`.`id` = `cf`.`account_id`))) group by `a`.`id`,`a`.`account_code`,`a`.`account_name`,`a`.`account_type`,`a`.`is_active`,`a`.`created_at` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-10  8:59:57
