<?php

// Upload children
foreach ($da_obj['value'] as &$da_ele) {
	switch ($da_ele['tag']) {
		case "DEFORMATION":
			$da_dd_obj=&$da_ele;
			include "da_dd.php";
			if (!empty($errors)) {
				return FALSE;
			}
			break;
		case "GAS":
			$da_gd_obj=&$da_ele;
			include "da_gd.php";
			if (!empty($errors)) {
				return FALSE;
			}
			break;
		case "HYDROLOGIC":
			$da_hd_obj=&$da_ele;
			include "da_hd.php";
			if (!empty($errors)) {
				return FALSE;
			}
			break;
		case "FIELDS":
			$da_fd_obj=&$da_ele;
			include "da_fd.php";
			if (!empty($errors)) {
				return FALSE;
			}
		case "THERMAL":
			$da_td_obj=&$da_ele;
			include "da_td.php";
			if (!empty($errors)) {
				return FALSE;
			}
			break;
		case "METEO":            // Nang added on 14-May-2102 
			$da_me_obj=&$da_ele;
			include "da_me.php";
			if (!empty($errors)) {
				return FALSE;
			}
			break;				
		case "SEISMIC":
			$da_sd_obj=&$da_ele;
			include "da_sd.php";
			if (!empty($errors)) {
				return FALSE;
			}
			break;
	}
}

?>