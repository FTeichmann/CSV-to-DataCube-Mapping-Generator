//ensuring no conflict for jquery calls
$.noConflict();
// adding interactive elements
// output of dynamic dimension fields
jQuery(document).ready(function(){
    //base variable initiation
    var dimensions = [];
    var staticFields = [];
    var uribase = "";
    var selectionMode = '';
    var mappingString = '';
    var tarqlMapping = '';
    var dataCubeString = '';
    //File Loader Event
    jQuery('input[id=file_upload]').on('change', function(event){
        uploader.loadFile(event);
    });
    //CSV Content Upload Event
    jQuery('#upload').click(function(){
        uploader.upload();
    });
    jQuery('#loadExample').click(function(){
        _loadExample();
    })
    jQuery('#loadDefault').click(function(){
        _loadDefault(dimensions);
    })
    //dimensionAdd Button
    jQuery('#dimensionAdd').click(function(){
        var dimension = {
            id : 'dimension' + (dimensions.length + 1),
            color : _getDimensionColor(dimensions.length + 1)
        };
        dimensions.push(dimension);
        var htmlString = "";
        if(dimensions.length == 1){
            htmlString += '\nDimension ' + (dimensions.length) + ' (horizontal)';
        }else{
            htmlString += '\nDimension ' + (dimensions.length) + ' (vertical)';
        }
        htmlString += '\n<input class=\"dimensionInputField form-control\" style=\"color:white; background-color:' +
        dimension['color'] + '\" id=\"'+ dimension['id'] + '\" size=\"40\" type=\"text\" value=\"\"/>\n';
        //output html into the dimensions field of the form
        jQuery('#' + config.dimensionsDivId).append(htmlString);
    });
    //add first dimension - horizontal Dimension
    jQuery('#dimensionAdd').trigger( "click" );
    //add Static Field Button
    jQuery('#addStaticField').click(function(){
        var field = {
            id : 'field' + (staticFields.length + 1),
            color : _getStaticFieldColor(staticFields.length + 1)
        };
        staticFields.push(field);
        var htmlString = '\nStatic Field ' + (staticFields.length) + ' property URI' +
        '\n<input class=\"staticFieldInput form-control\" style=\"background-color:' +
        field['color'] + '\" id=\"'+ field['id'] + '\" size=\"40\" type=\"text\" value=\"http://example.org/property'+ staticFields.length +'/\"/>\n';
        //output html into the dimensions field of the form
        jQuery('#' + config.staticFieldsDivId).append(htmlString);
    });
    //saveMetadata Button
    jQuery('#saveMetadata').click(function(){
        if(metaDataGatherer.sanityCheck(dimensions)){
            mappingString = metaDataGatherer.gatherMetadata(dimensions,staticFields);
        }
    });
    //generate tarql Mapping Button
    jQuery('#generateTarqlMapping').click(function(){
        if(mappingString.length == 0 ){
            jQuery('#' + config.messageFieldDivId).html('Please validate your metaData first.');
        }else{
            tarqlMapping = tarqlModule.generateTarqlMapping(mappingString);
            jQuery('#'+config.tarqlMappingDivId).val(tarqlMapping);
            tarqlMapping = jQuery('#tarqlMapping').val();
            jQuery('#' + config.messageFieldDivId).html('Tarql Mapping saved.');
        }
    });
    //upload Tarql Mapping Button
    jQuery('#loadTarqlMapping').click(function(){
        if(jQuery('#'+config.tarqlMappingDivId).val().length == 0){
            jQuery('#' + config.messageFieldDivId).html('Please generate or paste a Tarql mapping first.');
        }else{
            tarqlMapping = jQuery('#'+config.tarqlMappingDivId).val();
            jQuery('#' + config.messageFieldDivId).html('Tarql Mapping saved.');
        }
    });
    //upload DataCube Button
    jQuery('#loadDataCube').click(function(){
        if(jQuery('#' + config.dataCubeDivId).val().length == 0){
            jQuery('#' + config.messageFieldDivId).html('Please generate or paste a DataCube first.');
        }else{
            dataCubeString = jQuery('#' + config.dataCubeDivId).val();
            jQuery('#' + config.messageFieldDivId).html('DataCube saved.');
        }
    });
    //convertTarql Button
    jQuery('#convertTarql').click(function(){
        if(tarqlMapping.length == 0){
            jQuery('#' + config.messageFieldDivId).html('Please generate or load a Tarql mapping first.');
        }else if(jQuery('#'+config.csvFileAreaDiv).val().length == 0){
            jQuery('#' + config.messageFieldDivId).html('Please choose a file for the upload or paste the CSV content.');
        }else{
            var formdata = new FormData();
            formdata.append('csvData',jQuery('#'+config.csvFileAreaDiv).val());
            formdata.append('delimiter',jQuery('#'+config.delimiter).val());
            formdata.append('quotechar',jQuery('#'+config.quotechar).val());
            formdata.append('tarqlMapping', encodeURIComponent(tarqlMapping));
            jQuery.ajax({
                url: config.phpOrigin + '?action=tarqlMapping',
                type: 'POST',
                data: formdata,
                cache: false,
                dataType: 'json',
                processData: false, // Don't process the csvFile
                contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                success: function(response, textStatus, jqXHR){
                    if(typeof response.error === 'undefined'){
                        // Success so call function to process the form
                        if(response.length == 0){
                            jQuery('#' + config.messageFieldDivId).html('Something went wrong, the server could not find your document.');
                        }else{
                            dataCubeString = response;
                            //if the response string is shorter than 65, only the rdf prefix is given and no Triple.
                            if(dataCubeString.length <= 65){
                                jQuery('#' + config.dataCubeDivId).val('No DataCube could be created.\nPlease check your Mapping and CSV File for statistical contradictions.');
                            }else{
                                jQuery('#' + config.dataCubeDivId).val(response);
                            }
                            jQuery('#' + config.messageFieldDivId).html('DataCube saved.');
                        }
                    }else{
                        // Handle errors here
                        console.log('ERRORS: ' + response.error);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log('ERRORS: ' + textStatus);
                },
            });
        }
    });
    //validate DataCube Button
    jQuery('#validateDataCube').click(function(){
        if(dataCubeString.length == 0){
            jQuery('#' + config.messageFieldDivId).html('Please generate a DataCube first.');
        }else{
            jQuery.post(config.phpOrigin + '?action=validateDataCube',{ dataCubeString : encodeURIComponent(dataCubeString)}, function(response){
                jQuery('#'+ config.validationResultDivId).val(response);
            },'json');
        }
    });
    //selection mode actions
    //dimension selection action
    jQuery('#' + config.dimensionsDivId).on('click', 'input', function(){
        var clickedId = jQuery(this).attr('id');
        var color;
        jQuery.each(dimensions, function(key,dimension){
            if(dimension['id'] == clickedId){
                color = dimension['color'];
            }
        });
        // IF dimension id > dimension1 -> just mark one cell and print a different message
        if(clickedId == 'dimension1'){
            htmlString = '<div class=\"dimensionCellSelector\" style=\"background-color:' + color + '\">Please mark all horizontal dimension elements or double click a row.</div>';
        }else{
            htmlString = '<div class=\"dimensionCellSelector\" style=\"background-color:' + color + '\">Please mark the top dimension element in its row.</div>';
        }
        jQuery('#' + config.messageFieldDivId).html(htmlString);
        selectionMode = {
            mode : 'dimension',
            dimension : clickedId,
            color : color
        };
    });
    //selection mode actions
    //static Field selection action
    jQuery('#' + config.staticFieldsDivId).on('click', 'input', function(){
        var clickedId = jQuery(this).attr('id');
        var color;
        jQuery.each(staticFields, function(key,field){
            if(field['id'] == clickedId){
                color = field['color'];
            }
        });
        htmlString = '<div class=\"staticFieldSelector\" style=\"background-color:' + color + '\">Please mark the data field.</div>';
        jQuery('#' + config.messageFieldDivId).html(htmlString);
        selectionMode = {
            mode : 'staticField',
            field : clickedId,
            color : color
        };
    });
    //table cell click action
    jQuery('#' + config.tableDivId).on('click', 'div', function(){
        //does the cell already have a dimension or field value?
        if((selectionMode['mode'] == 'dimension' || selectionMode['mode'] == 'staticField') &&
        (jQuery(this).hasClass('staticFieldCell') || jQuery(this).hasClass('dimensionCell'))){
            //remove color, class and data
            jQuery(this).css('background-color', 'transparent');
            jQuery(this).removeClass('dimensionCell');
            jQuery(this).removeClass('staticFieldCell');
            jQuery(this).data();
        }else{
            if(selectionMode['mode'] == 'dimension' && jQuery(this).text().length > 0){
                if(selectionMode['dimension'] != 'dimension1'){
                    //for vertical dimensions: remove prior cell assignments
                    jQuery.each(jQuery('.dimensionCell'), function(key,cell){
                        if(jQuery(cell).data('dimension') == selectionMode['dimension']){
                            jQuery(cell).css('background-color', 'transparent');
                            jQuery(cell).removeClass('dimensionCell');
                            jQuery(cell).data();
                        }
                    });
                }
                jQuery(this).css('background-color', selectionMode['color']);
                jQuery(this).addClass('dimensionCell');
                jQuery(this).data('dimension',selectionMode['dimension']);
                //for vertical dimensions: clear selection Mode
                if(selectionMode['dimension'] != 'dimension1'){
                    selectionMode = {};
                    jQuery('#' + config.messageFieldDivId).html('Dimension cell marked.');
                }
            }else if(selectionMode['mode'] == 'staticField' && jQuery(this).text().length > 0){
                //removing static Field cell data should this data field exist already
                jQuery.each(jQuery('.staticFieldCell'), function(key,cell){
                    if(jQuery(cell).data('field') == selectionMode['field']){
                        jQuery(cell).css('background-color', 'transparent');
                        jQuery(cell).removeClass('staticFieldCell');
                        jQuery(cell).data();
                    }
                });
                //adding field cell Data
                jQuery(this).css('background-color', selectionMode['color']);
                jQuery(this).addClass('staticFieldCell');
                jQuery(this).data('field',selectionMode['field']);
                selectionMode = {};
                jQuery('#' + config.messageFieldDivId).html('Data field cell marked.');
            }
        }
    });
    //double click mode for dimension1
    jQuery('#' + config.tableDivId).on('dblclick', 'div', function(){
        if(selectionMode['dimension'] == 'dimension1'){
            //clicking every id within the same row as this
            jQuery("div[id^='"+this.id.split('-')[0]+"-']").trigger( "click" );
        }
    });
});
