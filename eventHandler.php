<?php
require_once './config.php';
$response = array();
/**
* expecting $_GEt['action'] to be used to call for a specific action
* every form Data is appended as $_POST for saver handling
*/
if(isset($_GET['action'])){
    if($_GET['action'] == 'csvFileUpload'){
        //parse the data to Rows
        $Rows = str_getcsv($_POST['csvData'],"\n",$_POST['quotechar']);
        //parsing only the first 25 Rows
        for($i = 0; $i < 1000 && $i < sizeof($Rows); $i++){
            array_push($response,str_getcsv($Rows[$i],$_POST['delimiter'],$_POST['quotechar']));
        }
    }
    elseif($_GET['action'] == 'tarqlMapping' && isset($_POST['tarqlMapping'])){
        //saving tarql Mapping and CSV Content as tmp file
        $tarqlMappingPath = tempnam('./uploads','mapping_');
        file_put_contents($tarqlMappingPath,urldecode($_POST['tarqlMapping']));
        $csvPath = tempnam('./uploads','csv_');
        file_put_contents($csvPath,urldecode($_POST['csvData']));
        //initiating result files
        $tarqlResult  = tempnam('./uploads','result_');
        $rapperedResult  = tempnam('./uploads','rappered_result_');
        //call to tarql and saving result to file
        exec( './'.$tarqlRunPath.' -H -d '.escapeshellarg($_POST['delimiter']).' --quotechar '.escapeshellarg($_POST['quotechar']).' '.$tarqlMappingPath.' '.$csvPath.' > '.$tarqlResult);
        //call rapper to remove double entries
        exec('rapper -q -i turtle -o turtle '.$tarqlResult.' > '.$rapperedResult);
        //saving results into response variable and removing tmp files
        $response = file_get_contents($rapperedResult);
        unlink($tarqlMappingPath);
        unlink($csvPath);
        unlink($tarqlResult);
        unlink($rapperedResult);
    }
    elseif($_GET['action'] == 'validateDataCube' && isset($_POST['dataCubeString'])){
        //saving DataCube as tmp file
        $dataCube = tempnam('./uploads','dataCube_');
        file_put_contents($dataCube,urldecode($_POST['dataCubeString']));
        //initiating result files
        $rapperedResult  = tempnam('./uploads','rappered_result_');
        $validationResult = tempnam('./uploads','validation_result_');
        //transforming Datacube to rdfxml vor validation
        exec('rapper -q -i turtle -o rdfxml '.$dataCube.' > '.$rapperedResult);
        //executing validation, saving result to file
        exec('java -jar '.$cubeValidatorPath.'/bin/CubeValidator.jar '.$rapperedResult.' '.$cubeValidatorPath.'/validationQueries > '.$validationResult);
        //saving results into response variable and removing tmp files
        $response = file_get_contents($validationResult);
        unlink($dataCube);
        unlink($rapperedResult);
        unlink($validationResult);
    }
    echo json_encode($response);
}
?>
