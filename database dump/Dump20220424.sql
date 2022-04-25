CREATE DATABASE  IF NOT EXISTS `coog_music` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `coog_music`;
-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: team-3-3380.cbbxip0p57sn.us-east-2.rds.amazonaws.com    Database: coog_music
-- ------------------------------------------------------
-- Server version	8.0.27

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `contains_tracks`
--

DROP TABLE IF EXISTS `contains_tracks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contains_tracks` (
  `track_song_id` int NOT NULL AUTO_INCREMENT,
  `track_published_by` char(32) NOT NULL,
  `playlist_playlist_ID` char(32) NOT NULL,
  PRIMARY KEY (`track_song_id`,`track_published_by`,`playlist_playlist_ID`),
  KEY `fk_track_has_album_track1_idx` (`track_song_id`,`track_published_by`),
  KEY `fk_contains_tracks_playlist1_idx` (`playlist_playlist_ID`),
  KEY `fk_contains_tracks_track1` (`track_published_by`),
  CONSTRAINT `fk_album_has_tracks_tracks` FOREIGN KEY (`track_song_id`, `track_published_by`) REFERENCES `track` (`song_id`, `published_by`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_contains_tracks_playlist1` FOREIGN KEY (`playlist_playlist_ID`) REFERENCES `playlist` (`playlist_ID`) ON DELETE CASCADE,
  CONSTRAINT `fk_contains_tracks_track1` FOREIGN KEY (`track_published_by`) REFERENCES `track` (`published_by`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_contains_tracks_track2` FOREIGN KEY (`track_song_id`) REFERENCES `track` (`song_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=286 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contains_tracks`
--

LOCK TABLES `contains_tracks` WRITE;
/*!40000 ALTER TABLE `contains_tracks` DISABLE KEYS */;
INSERT INTO `contains_tracks` VALUES (257,'electricblueowl','2860c029-c138-11ec-a6a4-02000317'),(258,'cornsilkterrier','2860c029-c138-11ec-a6a4-02000317'),(259,'denimlion','2860c029-c138-11ec-a6a4-02000317'),(261,'aquamarineelephant','2860c029-c138-11ec-a6a4-02000317'),(266,'aquamarineelephant','2860c029-c138-11ec-a6a4-02000317'),(285,'musician','2860c029-c138-11ec-a6a4-02000317'),(259,'denimlion','308d80c0-bf65-11ec-a6a4-02000317'),(262,'denimlion','309f9235-bf65-11ec-a6a4-02000317'),(264,'electricblueowl','309f9235-bf65-11ec-a6a4-02000317'),(257,'electricblueowl','3152568a-c12e-11ec-a6a4-02000317'),(258,'cornsilkterrier','3152568a-c12e-11ec-a6a4-02000317'),(259,'denimlion','3152568a-c12e-11ec-a6a4-02000317'),(264,'electricblueowl','3152568a-c12e-11ec-a6a4-02000317'),(285,'musician','3152568a-c12e-11ec-a6a4-02000317'),(258,'cornsilkterrier','797499ba-bf67-11ec-a6a4-02000317'),(259,'denimlion','797499ba-bf67-11ec-a6a4-02000317'),(257,'electricblueowl','fdd183fc-bf64-11ec-a6a4-02000317'),(258,'cornsilkterrier','fdd183fc-bf64-11ec-a6a4-02000317'),(261,'aquamarineelephant','fdd183fc-bf64-11ec-a6a4-02000317'),(262,'denimlion','fdd183fc-bf64-11ec-a6a4-02000317'),(264,'electricblueowl','fdd183fc-bf64-11ec-a6a4-02000317');
/*!40000 ALTER TABLE `contains_tracks` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `add_to_total_time` BEFORE INSERT ON `contains_tracks` FOR EACH ROW BEGIN

SET @theSum := 0.00;

SELECT SUM(track.length) INTO @theSum
	FROM track
	WHERE NEW.track_song_id = track.song_id;

UPDATE playlist
	SET playlist.full_length = playlist.full_length + @theSum
	WHERE NEW.playlist_playlist_ID = playlist.playlist_ID;
    
/********************************** IF SO DESIRED *************************************
UPDATE playlist
	SET playlist.last_updated = CURRDATE()
    WHERE OLD.playlist_playlist_ID = playlist.playlist_ID;
/**************************************************************************************/
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `remove_from_total_time` BEFORE DELETE ON `contains_tracks` FOR EACH ROW BEGIN

SET @theSum := 0.00;

SELECT SUM(track.length) INTO @theSum
	FROM track
	WHERE OLD.track_song_id = track.song_id;

UPDATE playlist
	SET playlist.full_length = playlist.full_length - @theSum
	WHERE OLD.playlist_playlist_ID = playlist.playlist_ID;

/********************************** IF SO DESIRED *************************************
UPDATE playlist
	SET playlist.last_updated = CURRDATE()
    WHERE OLD.playlist_playlist_ID = playlist.playlist_ID;
/**************************************************************************************/
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `alert_id` int NOT NULL AUTO_INCREMENT,
  `message` varchar(256) DEFAULT NULL,
  `attached_user` char(32) DEFAULT NULL,
  `date_made` char(32) DEFAULT (curdate()),
  PRIMARY KEY (`alert_id`),
  KEY `fk_notifications_user1` (`attached_user`),
  CONSTRAINT `fk_notifications_user1` FOREIGN KEY (`attached_user`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (88,'UPDATE: A song in one or more playlists has been deleted by the artist.','redwoodraccoon','2022-04-19'),(91,'UPDATE: A song in one or more playlists has been deleted by the artist.','redwoodraccoon','2022-04-19'),(97,'UPDATE: A song in one or more playlists has been deleted by the artist.','redwoodraccoon','2022-04-19'),(100,'UPDATE: A song in one or more playlists has been deleted by the artist.','redwoodraccoon','2022-04-19'),(103,'UPDATE: A song in one or more playlists has been deleted by the artist.','redwoodraccoon','2022-04-19'),(106,'UPDATE: A song in one or more playlists has been deleted by the artist.','redwoodraccoon','2022-04-19'),(109,'UPDATE: A song in one or more playlists has been deleted by the artist.','redwoodraccoon','2022-04-19'),(112,'UPDATE: A song in one or more playlists has been deleted by the artist.','redwoodraccoon','2022-04-19'),(115,'UPDATE: A song in one or more playlists has been deleted by the artist.','redwoodraccoon','2022-04-19'),(117,'UPDATE: A song in one or more playlists has been deleted by the artist.','redwoodraccoon','2022-04-19');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `alerts_remain` BEFORE DELETE ON `notifications` FOR EACH ROW BEGIN
	UPDATE user
		SET user.alerts = 0
        WHERE (
        SELECT attached_user 
			FROM notifications
			HAVING COUNT(*)
        ) <= 1;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `playlist`
--

DROP TABLE IF EXISTS `playlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlist` (
  `playlist_ID` char(32) NOT NULL,
  `playlist_name` char(32) NOT NULL DEFAULT 'Playlist',
  `created_at` char(32) DEFAULT (curdate()),
  `user_username` char(32) NOT NULL,
  `full_length` double DEFAULT '0',
  `is_private` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`playlist_ID`,`user_username`),
  UNIQUE KEY `playlist_ID` (`playlist_ID`),
  KEY `fk_playlist_user1_idx` (`user_username`),
  CONSTRAINT `fk_user_playlist1` FOREIGN KEY (`user_username`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlist`
--

LOCK TABLES `playlist` WRITE;
/*!40000 ALTER TABLE `playlist` DISABLE KEYS */;
INSERT INTO `playlist` VALUES ('1528f89a-c250-11ec-a6a4-02000317','Private Playlist','2022-04-22','caroline',0,1),('2860c029-c138-11ec-a6a4-02000317','Chill Vibes','2022-04-21','listener',23.14,0),('308739af-bf65-11ec-a6a4-02000317','Favorites','2022-04-18','mudmongoose',0,0),('308d80c0-bf65-11ec-a6a4-02000317','Dreary','2022-04-18','redwoodraccoon',3.26,0),('309f9235-bf65-11ec-a6a4-02000317','My Jams','2022-04-18','redwoodraccoon',13.51,0),('3152568a-c12e-11ec-a6a4-02000317','Private Playlist','2022-04-21','listener',17.9,1),('797499ba-bf67-11ec-a6a4-02000317','Creative','2022-04-18','redwoodraccoon',5.84,0),('b394c81f-c02c-11ec-a6a4-02000317','Private Playlist','2022-04-19','User',0,1),('fdcb396c-bf64-11ec-a6a4-02000317','Private Playlist','2022-04-18','sageswan',0,1),('fdd183fc-bf64-11ec-a6a4-02000317','Private Playlist','2022-04-18','redwoodraccoon',17.21,1),('fdd7c0eb-bf64-11ec-a6a4-02000317','Private Playlist','2022-04-18','platinumpigeon',0,1),('fdddff0c-bf64-11ec-a6a4-02000317','Private Playlist','2022-04-18','graysquirrel',0,1),('fde44291-bf64-11ec-a6a4-02000317','Private Playlist','2022-04-18','cyansparrow',0,1);
/*!40000 ALTER TABLE `playlist` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `new_playlist` BEFORE INSERT ON `playlist` FOR EACH ROW IF (NEW.playlist_ID IS NULL) THEN
SET NEW.playlist_ID = UUID();
END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `playlist_round` BEFORE UPDATE ON `playlist` FOR EACH ROW SET NEW.full_length = ROUND(NEW.full_length, 2) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `track`
--

DROP TABLE IF EXISTS `track`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `track` (
  `song_file` varchar(128) DEFAULT NULL,
  `cover_art` varchar(128) DEFAULT 'https://reptilesmagazine.com/wp-content/themes/magone/assets/images/default-thumbnail.png',
  `date_added` char(32) DEFAULT (curdate()),
  `song_id` int NOT NULL AUTO_INCREMENT,
  `song_name` char(32) NOT NULL,
  `length` double NOT NULL,
  `number_of_plays` int NOT NULL DEFAULT '0',
  `published_by` char(32) NOT NULL,
  PRIMARY KEY (`song_id`,`published_by`),
  KEY `fk_user_owns_track_user_idx` (`published_by`),
  CONSTRAINT `fk_user_owns_track_user` FOREIGN KEY (`published_by`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=287 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `track`
--

LOCK TABLES `track` WRITE;
/*!40000 ALTER TABLE `track` DISABLE KEYS */;
INSERT INTO `track` VALUES ('https://www.bensound.com/bensound-music/bensound-ukulele.mp3','https://www.bensound.com/bensound-img/ukulele.jpg','2022-04-18',257,'Ukulele',2.26,34,'electricblueowl'),('https://www.bensound.com/bensound-music/bensound-epic.mp3','https://www.bensound.com/bensound-img/epic.jpg','2022-04-18',258,'Epic',2.58,10,'cornsilkterrier'),('https://www.bensound.com/bensound-music/bensound-slowmotion.mp3','https://www.bensound.com/bensound-img/slowmotion.jpg','2022-04-18',259,'Slow Motion',3.26,9,'denimlion'),('https://www.bensound.com/bensound-music/bensound-dreams.mp3','https://www.bensound.com/bensound-img/dreams.jpg','2022-04-18',261,'Dreams',3.3,4,'aquamarineelephant'),('https://www.bensound.com/bensound-music/bensound-sweet.mp3','https://www.bensound.com/bensound-img/sweet.jpg','2022-04-18',262,'Sweet',5.07,3,'denimlion'),('https://www.bensound.com/bensound-music/bensound-newdawn.mp3','https://www.bensound.com/bensound-img/newdawn.jpg','2022-04-18',263,'New Dawn',5.13,12,'firebrickfalcon'),('https://www.bensound.com/bensound-music/bensound-groovyhiphop.mp3','https://www.bensound.com/bensound-img/groovyhiphop.jpg','2022-04-18',264,'Groovy Hip-Hop',4,3,'electricblueowl'),('https://www.bensound.com/bensound-music/bensound-highoctane.mp3','https://www.bensound.com/bensound-img/highoctane.jpg','2022-04-18',265,'High Octane',2.35,1,'sandybrownbuzzard'),('https://www.bensound.com/bensound-music/bensound-pianomoment.mp3','https://www.bensound.com/bensound-img/pianomoment.jpg','2022-04-18',266,'Piano Moment',1.5,3,'aquamarineelephant'),('http://coogmusic.com/music/bensound-actionable.mp3','http://coogmusic.com/cover_art/2.jpg','2022-04-19',278,'Actionable',2.05,4,'sandybrownbuzzard'),('http://coogmusic.com/music/Kalimba.mp3','http://coogmusic.com/cover_art/kalimba.jpg','2022-04-23',285,'CoolSong',5.8,1,'musician'),('http://coogmusic.com/music/darude.mp3','https://reptilesmagazine.com/wp-content/themes/magone/assets/images/default-thumbnail.png','2022-04-23',286,'Coolsong2',3.87,0,'musician');
/*!40000 ALTER TABLE `track` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `auto_playlist_alert` BEFORE DELETE ON `track` FOR EACH ROW BEGIN
	
    UPDATE user, playlist
	INNER JOIN contains_tracks ON 
	playlist.playlist_ID = contains_tracks.playlist_playlist_ID
	SET user.alerts = 67
    WHERE playlist.user_username = user.username;

	INSERT INTO notifications ( message, attached_user )
    SELECT 'UPDATE: A song in one or more playlists has been deleted by the artist.' AS message, username
    FROM user
    WHERE user.alerts = 67;
    
    UPDATE user
		SET user.alerts = 1
        WHERE user.alerts = 67;
    
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_type` int NOT NULL,
  `date_created` char(32) DEFAULT (curdate()),
  `pass` char(128) NOT NULL,
  `handle` char(32) NOT NULL,
  `username` char(32) NOT NULL,
  `alerts` int DEFAULT '0',
  `personal_playlist_ID` char(32) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`username`),
  UNIQUE KEY `handle_UNIQUE` (`handle`,`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=298 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (0,2,'2022-04-18','Admin','Admin','Admin',0,NULL),(266,1,'2022-04-18','3\"eArY?+<GW9gG6`','George','aquamarineelephant',0,NULL),(267,1,'2022-04-18','#%?^rn\"PGNz3AN<3','Max','sandybrownbuzzard',0,NULL),(268,1,'2022-04-18','s%B`hj\"#R2X,5.@;','David','cornsilkterrier',0,NULL),(270,1,'2022-04-18','(jqzE;jp4?!*LER','Victoria','denimlion',0,NULL),(271,1,'2022-04-18','Z\"e(\"65!Cb@Y-Fes','Melvin','electricblueowl',0,NULL),(272,1,'2022-04-18','vgZ>Ty?D$sy*66{`','Douglas','firebrickfalcon',0,NULL),(273,0,'2022-04-18','JLN2T6=<m9;m~=Kj','Ava','sageswan',0,'fdcb396c-bf64-11ec-a6a4-02000317'),(274,0,'2022-04-18','\"&&2(Jw3d^xL-C3a','Mia','redwoodraccoon',0,'fdd183fc-bf64-11ec-a6a4-02000317'),(275,0,'2022-04-18','!-muQc,arR{8_:Wm','Charlotte','platinumpigeon',0,'fdd7c0eb-bf64-11ec-a6a4-02000317'),(276,0,'2022-04-18','BGN@r%PFp\"6MV?vc','Muriel','graysquirrel',0,'fdddff0c-bf64-11ec-a6a4-02000317'),(277,0,'2022-04-18','Lgq~Hjzj5:DfJ*46','Anne','cyansparrow',0,'fde44291-bf64-11ec-a6a4-02000317'),(278,0,'2022-04-18','yDAq7FGqf!+xhu5e','Walter','mudmongoose',0,'fdea8910-bf64-11ec-a6a4-02000317'),(279,0,'2022-04-18','J{tN`/U9.-g#8SGB','Michael','moonstonemallard',0,'fdf0d16a-bf64-11ec-a6a4-02000317'),(281,0,'2022-04-18','nu$P[26,nrTU#NbP','Jennifer','auburnbear',0,'fdfd61fd-bf64-11ec-a6a4-02000317'),(292,1,'2022-04-19','123','abcd','notskyblueshrew',0,NULL),(293,0,'2022-04-19','User','User','User',0,'b394c81f-c02c-11ec-a6a4-02000317'),(294,1,'2022-04-19','musician','Musician','musician',0,NULL),(296,0,'2022-04-21','listener','listener','listener',0,'3152568a-c12e-11ec-a6a4-02000317'),(297,0,'2022-04-22','123456','caroline','caroline',0,'1528f89a-c250-11ec-a6a4-02000317');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `create_private_playlist` BEFORE INSERT ON `user` FOR EACH ROW BEGIN
IF (NEW.user_type = 0) THEN
SET foreign_key_checks = 0;
SET @TMP = '';

    INSERT INTO playlist (
    playlist_name,
    user_username,
    is_private 	)
    VALUES 		(
    'Private Playlist',
    NEW.username,
    1			);

SELECT playlist_ID INTO @TMP
FROM playlist
WHERE user_username = NEW.username;

SET NEW.personal_playlist_ID = @TMP;

SET foreign_key_checks = 1;
END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping events for database 'coog_music'
--

--
-- Dumping routines for database 'coog_music'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-04-24 20:52:11
