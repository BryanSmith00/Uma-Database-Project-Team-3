# UMA-Database-Project-Team-3

-- GETTING STARTED --<br>
`git clone https://github.com/BryanSmith00/Uma-Database-Project-Team-3`<br>
`cd /Uma-Database-Project-Team-3/CoogMusic`<br>
`sudo npm install`<br>
`node app.js`<br>
visit localhost:3000<br></br>


-- DIRECTORY STRUCTURE --
<br>

/mysql scripts - Contains data entry scripts for easily resetting the dbms

/CoogMusic - The main project folder

/CoogMusic/cover_art - Storage for any uploaded songs cover art<br>
/CoogMusic/Music - Music file storage<br>

We chose not to store this information on the server as the hosting costs would be increased with many file and image transfers<br>

/CoogMusic/app.js - Main file for the webapp which includes all of our routes

/CoogMusic/public - Constains the resources for the frontend and script for the webapp<br>

/CoogMusic/public/database.js - This is where we establish a connection to the database when the application starts<br>

/CoogMusic/public/passport.js - User authentication

/CoogMusic/views - Contains all of our frontend pages