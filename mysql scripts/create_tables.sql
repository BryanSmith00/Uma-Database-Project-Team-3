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

