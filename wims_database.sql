-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: wims_database
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'CREATE_USER','Created user angelica (Staff)','::1','2025-12-18 07:56:07','2025-12-18 07:56:07'),(2,1,'UPDATE_USER','Updated user ID 4 (angelica)','::1','2025-12-18 07:56:32','2025-12-18 07:56:32'),(3,2,'CREATE_PRODUCT','Created product ELEC-001 (Headband)','::1','2025-12-18 08:36:02','2025-12-18 08:36:02'),(4,1,'CREATE_PRODUCT','Created product ELEC-001 (Wireless Optical Mouse)','127.0.0.1','2025-12-08 17:27:31','0000-00-00 00:00:00'),(5,1,'CREATE_PRODUCT','Created product ELEC-002 (Mechanical Keyboard RGB)','127.0.0.1','2025-12-08 17:27:31','0000-00-00 00:00:00'),(6,1,'UPDATE_PRODUCT','Updated stock for OFF-001','127.0.0.1','2025-12-15 17:27:31','0000-00-00 00:00:00'),(7,1,'DELETE_PRODUCT','Deleted product TEST-001','127.0.0.1','2025-12-18 17:27:31','0000-00-00 00:00:00'),(8,1,'CREATE_PRODUCT','Created product ELEC-003 (Shampoo)','::1','2025-12-18 09:28:57','2025-12-18 09:28:57'),(9,1,'UPDATE_PRODUCT','Updated SKU ELEC-003','::1','2025-12-18 09:29:38','2025-12-18 09:29:38'),(10,1,'CREATE_USER','Created user hero (Manager)','::1','2025-12-18 09:46:06','2025-12-18 09:46:06');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_movement_log`
--

DROP TABLE IF EXISTS `product_movement_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_movement_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `movement_type` enum('IN','OUT','ADJUSTMENT') NOT NULL,
  `quantity_change` int(11) NOT NULL,
  `from_location` varchar(100) DEFAULT NULL,
  `to_location` varchar(100) DEFAULT NULL,
  `transaction_notes` text DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `product_movement_log_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_movement_log_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_movement_log`
--

LOCK TABLES `product_movement_log` WRITE;
/*!40000 ALTER TABLE `product_movement_log` DISABLE KEYS */;
INSERT INTO `product_movement_log` VALUES (1,1,2,'IN',100,NULL,'Warehouse Zone A','Initial Stock','2025-12-18 08:36:02','0000-00-00 00:00:00','0000-00-00 00:00:00'),(12,2,1,'IN',60,NULL,'Warehouse Zone A','Initial Stock','2025-12-18 09:28:57','0000-00-00 00:00:00','0000-00-00 00:00:00');
/*!40000 ALTER TABLE `product_movement_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sku` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `reorder_point` int(11) NOT NULL DEFAULT 10,
  `location` varchar(100) DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'ELEC-001','Headband','',100,20,'Warehouse Zone A',0.11,'Electronics','2025-12-18 08:36:02','2025-12-18 08:36:02'),(2,'ELEC-003','Shampoo','',60,100,'Warehouse Zone A',0.50,'Perishables','2025-12-18 09:28:57','2025-12-18 09:29:38');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Manager','Staff') NOT NULL DEFAULT 'Staff',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Khim','Limbona','Khimadmin@wims.com','admin','$2b$10$fWwqQXdDhBENhs36RQqJ6el/SUflvq2SThhtso6evzlkPGBmHlzfq','Admin',1,'2025-12-18 04:10:00','2025-12-18 04:10:00'),(2,'Hafsah','Mangorangca','manager@wims.com','manager','$2b$10$KeCpD1RZlDyVuktVHDbq2eqp3VP9qKyS.ZK8WKaW.PxEfjxQYF.Mu','Manager',1,'2025-12-18 04:10:00','2025-12-18 04:10:00'),(3,'Yasser','Maguidala','staff@wims.com','staff','$2b$10$.n1.Wmsm9n3kSjSrnteCPO0Cz157DhNXiNPmXjyH36uPcrbv48AVa','Staff',1,'2025-12-18 04:10:00','2025-12-18 04:10:00'),(4,'Angel','Napone III','angelica@gmail.ccom','angelica','$2b$10$bypMmoTGqydfAlDQ040C8uVWdvY3KnMOUPRIx5wNFvd.nU/kEVHmW','Staff',1,'2025-12-18 07:56:07','2025-12-18 07:56:32'),(5,'John','Hero','hero@gmail.com','hero','$2b$10$QuVSjJn/K7gPRLDevf6AoeoPP/d.XX/NYnbWw2HIuM0I4s7uKDJWm','Manager',1,'2025-12-18 09:46:06','2025-12-18 09:46:06');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-18 20:50:03
