<?php
session_start();
	
include "../view/commonInsert_v.php";
include "../view/insert_cn_v.php";
include "../convertie/model/commonInsertForm_m.php";
require_once "php/include/get_root.php";


if(!isset($_SESSION['login'])) {
	header('Location: '.$url_root.'login_required.php');
}

showCommonHeader();   			    //Show html header 
showCssExternalJs();				//Get Css and external js link


$obs=getCcList();      				//Get observatory list
$cbs=getCbList();                   //Get Bibliographic list

showUpdateTableList($obs,$cbs);     

showCommonFooter();            		//Show html footer


?>