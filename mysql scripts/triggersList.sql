/**************************************************************************************/
/**************************************************************************************
DELIMITER $$
CREATE TRIGGER new_playlist
BEFORE INSERT ON playlist
FOR EACH ROW
IF (NEW.playlist_ID IS NULL) THEN
SET NEW.playlist_ID = UUID();
END IF;
$$
/**************************************************************************************/
/**************************************************************************************

DELIMITER $$
CREATE TRIGGER add_to_total_time
BEFORE INSERT ON contains_tracks
FOR EACH ROW
BEGIN

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
/**************************************************************************************
END;
$$

/**************************************************************************************/
/**************************************************************************************

DELIMITER $$
CREATE TRIGGER remove_from_total_time
BEFORE DELETE ON contains_tracks
FOR EACH ROW
BEGIN

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
/**************************************************************************************
END;
$$

/**************************************************************************************/
/**************************************************************************************
DELIMITER $$
CREATE TRIGGER auto_playlist_alert
BEFORE DELETE ON track
FOR EACH ROW
BEGIN
	
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
    
END;
$$
/**************************************************************************************/
/**************************************************************************************
DELIMITER $$
CREATE TRIGGER alerts_remain
BEFORE DELETE ON notifications
FOR EACH ROW
BEGIN
	UPDATE user
		SET user.alerts = 0
        WHERE (
        SELECT attached_user 
			FROM notifications
			HAVING COUNT(*)
        ) <= 1;
END;
$$
/**************************************************************************************/
/**************************************************************************************
DELIMITER $$
CREATE TRIGGER create_private_playlist
BEFORE INSERT ON user
FOR EACH ROW
BEGIN
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
END;
$$
/**************************************************************************************/
/**************************************************************************************

CREATE TRIGGER playlist_round
BEFORE UPDATE ON playlist
FOR EACH ROW
SET NEW.full_length = ROUND(NEW.full_length, 2);

/**************************************************************************************/
/**************************************************************************************/