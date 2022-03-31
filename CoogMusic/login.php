<?php
$servername = "team-3-3380.cbbxip0p57sn.us-east-2.rds.amazonaws.com";
$username = "admin";
$password = "*ZrYDzw*Puctowy\$nf42";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
} 
echo "Connected successfully";
?>




