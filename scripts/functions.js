/*
* helper functions
*/
//getting up to 5 distinguishable colors for dimensions
function _getDimensionColor(number){
    switch(number){
        case 1: return 'rgb(148,111,199)';
        break;

        case 2: return 'rgb(122,164,68)';
        break;

        case 3: return 'rgb(202,84,119)';
        break;

        case 4: return 'rgb(76,171,152)';
        break;

        case 5: return 'rgb(197,123,61)';
        break;

        default:  {
            var r = Math.round(Math.random() * (90 - 50) + 50);
            var g = Math.round(Math.random() * (90 - 50) + 50);
            var b = Math.round(Math.random() * (90 - 50) + 50);
            return 'rgb(' + r + '%,' + g + '%,' + b + '%)';
        }
    }
};
//getting up to 5 distinguishable colors for static fields
function _getStaticFieldColor(number){
    switch(number){
        case 1: return 'rgb(162,213,214)';
        break;

        case 2: return 'rgb(222,187,212)';
        break;

        case 3: return 'rgb(202,84,119)';
        break;

        case 4: return 'rgb(190,216,181)';
        break;

        case 5: return 'rgb(175,194,227)';
        break;

        default:  {
            var r = Math.round(Math.random() * (90 - 50) + 50);
            var g = Math.round(Math.random() * (90 - 50) + 50);
            var b = Math.round(Math.random() * (90 - 50) + 50);
            return 'rgb(' + r + '%,' + g + '%,' + b + '%)';
        }
    }
};
//checking for a valid input url using html5
function _checkurl(url){
    var elm = document.createElement('input');
    elm.setAttribute('type', 'url');
    elm.value = url;
    return elm.validity.valid;
}
//getting current Date as ddmmyy
function _getDate(){
    var currentDate = new Date()
    var day = currentDate.getDate()
    var month = currentDate.getMonth() + 1
    var year = currentDate.getFullYear()
    return(day + "/" + month + "/" + year)
}
//mapping Row numbers to automatic column headers
// 1->a 25->y 27->aa ...
function _getHeaderFromNumber(number){
    return (
        'abcdefghijklmnopqrstuvwxyz'.charAt((Math.ceil(number/26)-1)-1) +
        'abcdefghijklmnopqrstuvwxyz'.charAt((number-((Math.ceil(number/26))*26)+26)-1)
    );
}
//loading Example CSV Content into the GUI and filling in Metadata
function _loadExample(){
    var exampleCSV = 'room,desks,chairs,monitors,plants\n'+
    'A110,3,3,2,2\n'+
    'A112,3,2,4,6\n'+
    'A114,3,2,2,1\n'+
    'A116,3,2,2,1\n';
    //loading example CSV String into Input Area
    jQuery('#' + config.csvFileAreaDiv).val(exampleCSV);
    //triggering upload
    jQuery('#upload').trigger("click");
    //filling in Metadata
    jQuery('#' + 'DataSetUri').val('http://exampleOffice.org/Inventory');
    jQuery('#' + 'DataStructureDefinitionUri').val('http://exampleOffice.org/InventoryStructure');
    jQuery('#' + 'MeasureUri').val('http://exampleOffice.org/NumberOfItems');
    jQuery('#' + 'ObservationUri').val('http://exampleOffice.org/InventoryEntry/');

    //filling two dimensions
    jQuery('#' + 'dimension1').val('http://exampleOffice.org/Inventory/Position');
    if(!jQuery('#dimension2').val()){
        jQuery('#dimensionAdd').trigger("click");
    }
    jQuery('#' + 'dimension2').val('http://exampleOffice.org/Inventory/RoomNumber');

    //triggering click on Dimension 1 an selecting first Row

    setTimeout(function(){jQuery('#dimension1').trigger("click");}, 100);
    setTimeout(function(){jQuery('#1-1').trigger("dblclick");}, 100);
    //triggering click on Dimension 2 and selection (1,1)
    setTimeout(function(){jQuery('#dimension2').trigger("click");}, 100);
    setTimeout(function(){jQuery('#1-1').trigger("click");}, 100);
    setTimeout(function(){jQuery('#1-1').trigger("click");}, 100);
    //triggering Metadata Validation and Mapping Creation
    setTimeout(function(){jQuery('#saveMetadata').trigger("click");}, 100);
    setTimeout(function(){jQuery('#generateTarqlMapping').trigger("click");}, 100);
    setTimeout(function(){jQuery('#convertTarql').trigger("click");}, 200);
    setTimeout(function(){jQuery('#validateDataCube').trigger("click");}, 1000);


}
//loading default values into the Metadata Configuration field
function _loadDefault(dimensions){
    jQuery('#' + 'DataSetUri').val('http://example.org/MyDataSet');
    jQuery('#' + 'DataStructureDefinitionUri').val('http://example.org/MyDataStructureDefinition');
    jQuery('#' + 'MeasureUri').val('http://example.org/MyMeasure');
    jQuery('#' + 'ObservationUri').val('http://example.org/MyDataSet/Observation/');

    jQuery.each(dimensions,function(key,dimension){
        console.log(dimension);
        jQuery('#' + dimension.id).val('http://example.org/' + dimension.id);
    });
}
