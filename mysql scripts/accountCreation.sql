
/* BASIC ACCOUNTS */

INSERT INTO user (
user_id,
user_type,
pass,
username,
handle )
VALUES (
0,
2,
'Admin',
'Admin',
'Admin'
);

UPDATE user
	SET user_id = 0
    WHERE username = 'Admin';

INSERT INTO user (
user_id,
user_type,
pass,
username,
handle )
VALUES (
1,
1,
'Musician',
'Musician',
'Musician'
);

INSERT INTO user (
user_id,
user_type,
pass,
username,
handle )
VALUES (
2,
0,
'Listener',
'Listener',
'Listener'
);

/* MUSICIANS */

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
1,
'3"eArY?+<GW9gG6`',
'aquamarineelephant',
'George'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
1,
'#%?^rn"PGNz3AN<3',
'sandybrownbuzzard',
'Max'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
1,
's%B`hj"#R2X,5.@;',
'cornsilkterrier',
'David'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
1,
'`9g`X\hX9MW,@a_C',
'alabasterraven',
'Margaret'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
1,
'(jqzE;jp4?!*L\ER',
'denimlion',
'Victoria'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
1,
'Z"e("65!Cb@Y-Fes',
'electricblueowl',
'Melvin'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
1,
'vgZ>Ty?D$sy*66{`',
'firebrickfalcon',
'Douglas'
);


/* LISTENERS */

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
0,
'JLN2T6=<m9;m~=Kj',
'sageswan',
'Ava'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
0,
'"&&2(Jw3d^xL-C3a',
'redwoodraccoon',
'Mia'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
0,
'!-muQc,arR{8_:Wm',
'platinumpigeon',
'Charlotte'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
0,
'BGN@r%PFp"6MV?vc',
'graysquirrel',
'Muriel'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
0,
'Lgq~Hjzj5:DfJ*46',
'cyansparrow',
'Anne'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
0,
'yDAq7FGqf!+xhu5e',
'mudmongoose',
'Walter'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
0,
'J{tN`/U9.-g#8SGB',
'moonstonemallard',
'Michael'
);


INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
0,
'mUjxdkdVa,}2s^6*',
'lilaclemur',
'Elijah'
);

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
0,
'nu$P[26,nrTU#NbP',
'auburnbear',
'Jennifer'
);
SET foreign_key_checks = 0;

INSERT INTO user (
user_type,
pass,
username,
handle )
VALUES (
0,
'bRZ_v5G\sw-B/2%j',
'pinkpig',
'Jacob'
);

INSERT INTO user (
user_type,
pass,
handle,
username )
VALUES (
0,
'.XnJwZ6md&p((33Z',
'Samantha',
'skyblueshrew'
);
