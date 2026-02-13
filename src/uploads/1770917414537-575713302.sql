-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: seci_prod_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dept_master`
--

DROP TABLE IF EXISTS `dept_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dept_master` (
  `dept_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `dept_name` varchar(255) NOT NULL,
  `regular_count` int DEFAULT '0',
  `yp_count` int DEFAULT '0',
  `contractual_count` int DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dept_master`
--

LOCK TABLES `dept_master` WRITE;
/*!40000 ALTER TABLE `dept_master` DISABLE KEYS */;
INSERT INTO `dept_master` VALUES ('1cf008a2-939d-4dee-bb72-73c33a0d69f3','QA',2,0,18,0,'2025-07-30 10:29:37','2025-10-03 07:00:36'),('23583211-ecea-4bb4-acef-aab520d373a5','Business Development',3,0,0,1,'2025-07-30 10:29:37','2025-09-10 03:41:56'),('39bd2007-458d-440e-a7e5-9f41409a3413','Contracts & Procurement',6,1,7,1,'2025-07-30 10:29:37','2025-07-30 10:29:37'),('414066e1-02b7-4587-ac79-e3cca92b7809','Projects',0,3,0,1,'2025-07-30 10:29:37','2025-07-30 10:29:37'),('88f23f26-edb4-4f00-9c84-c0e4237f54b6','Live Tenders',0,0,0,1,'2025-08-27 05:00:14','2025-08-27 05:00:14'),('89a592c0-5e1b-436f-815d-e4ad6ab72656','O&M',4,4,7,1,'2025-07-30 10:29:37','2025-07-30 10:29:37'),('a5a7df90-69b6-4697-a05a-8bc677236d8d','REIA',2,1,11,1,'2025-07-30 10:29:37','2025-07-30 10:29:37'),('d78911c8-0b65-45f6-b669-e6b56ed4ad39','Engineering',7,4,6,0,'2025-07-30 10:29:37','2025-08-07 09:42:19'),('edb667d8-6dfc-11f0-8e84-20040ffb7271','PMC',0,0,0,1,'2025-07-31 16:25:53','2025-07-31 16:25:53'),('fb44a972-d8db-4ea4-9343-682706337f46','Energy Mangement',7,3,19,1,'2025-07-30 10:29:37','2025-07-30 10:29:37');
/*!40000 ALTER TABLE `dept_master` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-11 15:41:05
