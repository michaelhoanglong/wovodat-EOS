<?php

// vvv Set variables
$ms_si_si_key="si";
$ms_si_si_name="SeismicInstrument";

// ^^^ Get code
$code=xml_get_att($ms_si_si_obj, "CODE");

// -- CHECK DATA --

// ^^^ Get owners
if (!v1_get_owners($ms_si_si_obj, $error)) {
	$errors[$l_errors]=$error;
	$l_errors++;
	return FALSE;
}

// vvv Set owners
if (!v1_set_owners($ms_si_si_obj)) {
	// Missing information
	$errors[$l_errors]=array();
	$errors[$l_errors]['code']=1;
	$errors[$l_errors]['message']="&lt;".$ms_si_si_name." code=\"".$code."\"&gt; is missing information: please specify owner";
	$l_errors++;
	return FALSE;
}

// ^^^ Get times
$ms_si_si_stime=xml_get_ele($ms_si_si_obj, "STARTTIME");
$ms_si_si_etime=xml_get_ele($ms_si_si_obj, "ENDTIME");

// ### Check time order
if (!empty($ms_si_si_stime) && !empty($ms_si_si_etime)) {
	if (strcmp($ms_si_si_stime, $ms_si_si_etime)>0) {
		$errors[$l_errors]=array();
		$errors[$l_errors]['code']=2;
		$errors[$l_errors]['message']="In &lt;".$ms_si_si_name." code=\"".$code."\"&gt;, start time (".$ms_si_si_stime.") should be earlier than end time (".$ms_si_si_etime.")";
		$l_errors++;
		return FALSE;
	}
}

// ^^^ Get station
v1_get_ms($ms_si_si_obj, "STATION", $gen_stations);

// vvv Set station
if (!v1_set_ms($ms_si_si_obj, $ms_si_si_name, $code, $ms_si_si_stime, $ms_si_si_etime, "seismic station", "ss", "ss", NULL, NULL, $gen_stations, $error)) {
	// Error
	array_push($errors, $error);
	$l_errors++;
	return FALSE;
}

// ### Check necessary information: station
if (empty($ms_si_si_obj['results']['ss_id'])) {
	// Missing information
	$errors[$l_errors]=array();
	$errors[$l_errors]['code']=1;
	$errors[$l_errors]['message']="&lt;".$ms_si_si_name." code=\"".$code."\"&gt; is missing information: please specify station";
	$l_errors++;
	return FALSE;
}

// ^^^ Get publish date
v1_get_pubdate($ms_si_si_obj);

// vvv Set publish date
$data_time=array($ms_si_si_stime, $ms_si_si_etime);
v1_set_pubdate($data_time, $current_time, $ms_si_si_obj);

// -- CHECK DUPLICATION --

// ### Check duplication
$final_owners=$ms_si_si_obj['results']['owners'];
if (!v1_check_dupli_timeframe($ms_si_si_name, $ms_si_si_key, $code, $ms_si_si_stime, $ms_si_si_etime, $final_owners, $dupli_error)) {
	// Duplication found
	$errors[$l_errors]=array();
	$errors[$l_errors]['code']=7;
	$errors[$l_errors]['message']=$dupli_error;
	$l_errors++;
	return FALSE;
}

// -- RECORD OBJECT --

// vvv Record object
$data=array();
$data['ss_id']=$ms_si_si_obj['results']['ss_id'];
$data['owners']=$final_owners;
$data['stime']=$ms_si_si_stime;
$data['etime']=$ms_si_si_etime;
v1_record_obj($ms_si_si_key, $code, $data);

// -- CHECK DATABASE --

// ### Check existing data in database
if (!v1_check_db_timeframe($ms_si_si_name, $ms_si_si_key, $code, $ms_si_si_stime, $ms_si_si_etime, $final_owners, $check_db_error)) {
	// Duplication found
	$errors[$l_errors]=array();
	$errors[$l_errors]['code']=8;
	$errors[$l_errors]['message']=$check_db_error;
	$l_errors++;
	return FALSE;
}

// -- CHECK CHILDREN --

// ### Check children
foreach ($ms_si_si_obj['value'] as &$ms_si_si_ele) {
	switch ($ms_si_si_ele['tag']) {
		case "SEISMICCOMPONENT":
			$ms_si_si_sc_obj=&$ms_si_si_ele;
			include "ms_si_si_sc.php";
			if (!empty($errors)) {
				return FALSE;
			}
			break;
	}
}

// -- PREPARE DISPLAY --

// Increment data count (for display)
if (!isset($data_list[$ms_si_si_key])) {
	$data_list[$ms_si_si_key]=array();
	$data_list[$ms_si_si_key]['name']="Seismic instrument";
	$data_list[$ms_si_si_key]['number']=0;
	$data_list[$ms_si_si_key]['sets']=array();
}
$data_list[$ms_si_si_key]['number']++;

// -- POP OUT GENERAL INFO --

// Pop general informations
array_shift($gen_owners);
array_shift($gen_stations);
array_shift($gen_pubdates);

?>