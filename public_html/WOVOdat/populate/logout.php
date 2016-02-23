<?php
// Allow bigger memory limit
ini_set("memory_limit","2048M");

// Start session
session_start();

// Destroy session
session_destroy();

// Get root url
require_once "php/include/get_root.php";

// remove cookie of boolean search form
setcookie("booleanData", $value, time() - 3600 , "/");

// Redirect to welcome page
header('Location: /index.php');
exit();



/* 
old Scripts before adding the scirpts to delete boolean search cookies  - 26-Jan-2015
 
// Allow bigger memory limit
ini_set("memory_limit","2048M");

// Start session
session_start();

// Destroy session
session_destroy();

// Get root url
require_once "php/include/get_root.php";

// Redirect to welcome page
header('Location: /index.php');
exit();
*/
?>