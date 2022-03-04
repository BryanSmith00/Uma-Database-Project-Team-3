CREATE TABLE track (
song_file  MEDIUMBLOB,
date_added date,
song_id int PRIMARY KEY,
song_name char(32),
length int unsigned,
number_of_plays int unsigned
);

CREATE TABLE album (
	album_id int PRIMARY KEY,
    album_name char(32),
    date_created date
);

CREATE TABLE permission (
	permission_type_id INT PRIMARY KEY,
    
    permission_name CHAR(32),
    permission_set INT
);

CREATE TABLE user (
	user_id INT PRIMARY KEY,
    
    user_type INT,
    date_created INT,
    
    pass CHAR(32),
    handle CHAR(32),
    username CHAR(32)
);

CREATE TABLE playlist (
  playlist_id int PRIMARY KEY,
  playlist_name char(45) DEFAULT NULL,
  playlist_author char(45) DEFAULT NULL,
  playlist_songs blob
);
