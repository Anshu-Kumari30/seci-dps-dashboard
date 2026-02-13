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
-- Table structure for table `dept_statistic`
--

DROP TABLE IF EXISTS `dept_statistic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dept_statistic` (
  `dept_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `statistic_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `statistic_name` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_shown_on_home` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`dept_id`,`statistic_id`),
  UNIQUE KEY `statistic_id` (`statistic_id`),
  CONSTRAINT `dept_statistic_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `dept_master` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dept_statistic`
--

LOCK TABLES `dept_statistic` WRITE;
/*!40000 ALTER TABLE `dept_statistic` DISABLE KEYS */;
INSERT INTO `dept_statistic` VALUES ('1cf008a2-939d-4dee-bb72-73c33a0d69f3','06c05c07-6053-4847-aff7-74bc5b85c31e','Documents/PDI',1,1,'2025-07-30 10:29:37','2025-07-30 10:29:37'),('23583211-ecea-4bb4-acef-aab520d373a5','491cf71d-803c-4b2f-8a3e-f3738008ea91','Proposals',1,1,'2025-07-30 10:29:37','2025-08-25 04:40:07'),('39bd2007-458d-440e-a7e5-9f41409a3413','d96bb534-3784-488e-8b8c-2c502673ebbe','Tenders',1,1,'2025-07-30 10:29:37','2025-08-12 07:46:59'),('414066e1-02b7-4587-ac79-e3cca92b7809','b8488c45-0fc5-4264-95cb-f71d54b6b5d2','Capex Projects',1,1,'2025-07-30 10:29:37','2025-10-27 06:54:51'),('89a592c0-5e1b-436f-815d-e4ad6ab72656','9288140b-1c2d-4176-a5dc-595cfb84aab0','O&M Plants',1,1,'2025-07-30 10:29:37','2026-01-27 09:08:58'),('a5a7df90-69b6-4697-a05a-8bc677236d8d','1e740bc8-6895-41a2-bb87-c884bcf381da','Schemes',1,1,'2025-07-30 10:29:37','2025-07-30 10:29:37'),('d78911c8-0b65-45f6-b669-e6b56ed4ad39','98bf1f22-44a2-4447-afc4-f115cc915af5','Drawings/PDI',1,1,'2025-07-30 10:29:37','2025-07-30 10:29:37'),('edb667d8-6dfc-11f0-8e84-20040ffb7271','1a0e53af-71f9-11f0-8e84-20040ffb7271','DPR/PFR',1,1,'2025-08-05 18:08:34','2025-12-01 06:17:35'),('fb44a972-d8db-4ea4-9343-682706337f46','52e10e3e-0e74-4181-ad91-8a2b19389e75','PPA',1,1,'2025-07-30 10:29:37','2025-07-30 10:29:37');
/*!40000 ALTER TABLE `dept_statistic` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-11 15:41:06
