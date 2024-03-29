<?php
/**
 *	This class supports query the data from data table sd_evn
 * 	
 */
// DEFINE('HOST', 'localhost');
// require_once '..//TableManager.php';
class sd_evnManager extends SeismicTablesManager {
	
	protected function setColumnsName(){
		$result = array("sd_evn_edep","sd_evn_pmag");
		return $result;
	}
	protected function setTableName(){
		return "es_sd_evn";
	}
	
	protected function setDataType(){
		return "SeismicEventFromNetwork";
	} // Data type for each data table
	//if there is 1 station, station1 is the same as station2
	protected function setStationID(){
		$result = array("sn_id","sn_id");
		return $result;
	} // column names represent stationID1,station ID2
	protected function setStationCode(){
		$result = array("n_code","n_code");
		return $result;
	} // column name represent primary stationCode1, stationCode2.
	protected function setStationDataParams($component){
		$unit="";
		$query = "";
		$table = "sd_evn";
		$errorbar = true;
		$style = "circle";
		$vd_long = $this->vd_long;
		$vd_lat = $this->vd_lat;
		// var_dump($this);
		if($component == 'Earthquake Depth'){ 
			$unit = "km";
			$style = "circle";
			$errorbar = false;
			$attribute = "sd_evn_edep";
			$query = "select a.sd_evn_eqtype as filter, a.sd_evn_time as time, 0 - a.$attribute as value  from $table  as a where 6371*acos(sin(RADIANS(sd_evn_elat))*sin(RADIANS($vd_lat))+cos(RADIANS(sd_evn_elat)) *cos(RADIANS($vd_lat))*cos(RADIANS($vd_long)-RADIANS(sd_evn_elon))) <= 30 and sd_evn_pubdate <= now() and sd_evn_edep BETWEEN -10 AND 40 and a.sn_id=%s and a.$attribute IS NOT NULL";
		}else if($component == 'Earthquake Magnitude'){
			$style = "circle";
			$errorbar = false;
			$attribute = "sd_evn_pmag";
			$query = "select a.sd_evn_eqtype as filter ,a.sd_evn_time as time, a.$attribute as value  from $table  as a where
             6371*acos(sin(RADIANS(sd_evn_elat))*sin(RADIANS($vd_lat))+cos(RADIANS(sd_evn_elat)) *cos(RADIANS($vd_lat))*cos(RADIANS($vd_long)-RADIANS(sd_evn_elon))) <= 30 and sd_evn_pubdate <= now() and sd_evn_edep BETWEEN -10 AND 40 and a.sn_id=%s and a.$attribute IS NOT NULL";
		}

		// echo $query;

		$result = array("unit" => $unit,
						"style" => $style,
						"errorbar" => $errorbar,
						"query" =>$query
						);
		return $result;
	} // params to get data station [unit,flot_style,errorbar,query]

    protected function setShortDataType()
    {
        // TODO: Implement setShortDataType() method.
        return "Network Events";
    }

	protected function setLatLong(){
		return array("sd_evn_elat", "sd_evn_elon");
	}
}