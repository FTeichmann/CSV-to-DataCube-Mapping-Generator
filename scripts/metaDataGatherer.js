var metaDataGatherer = (function(){
    var gatherMetadata = function(dimensions,staticFields){
        var metaData = {};
        metaData.ObservationUri = jQuery("#ObservationUri").val();
        metaData.DataSetUri = jQuery("#DataSetUri").val();
        metaData.DataStructureDefinitionUri = jQuery("#DataStructureDefinitionUri").val();
        metaData.MeasureUri = jQuery("#MeasureUri").val();
        //instanciate cells collection for every dimension
        jQuery(dimensions).each(function(counter,dim){
            dim.cells = [];
        });
        //iterate over every dimension input field and attach labels
        jQuery('input.dimensionInputField').each(function(){
            var dimensionId = jQuery(this).attr('id');
            var dimensionLabel = jQuery(this).val();
            jQuery(dimensions).each(function(counter,dim){
                if(dim['id'] == dimensionId){
                    dim.uri = dimensionLabel;
                }
            });
        });
        //iterate over every static Input field and attach property + object
        jQuery('input.staticFieldInput').each(function(){
            var fieldId = jQuery(this).attr('id');
            var fieldProperty = jQuery(this).val();
            var fieldValue = "";
            //search for corresponding static field cell and set the Field Value
            jQuery.each(jQuery('.staticFieldCell'), function(key,fieldcell){
                if(jQuery(fieldcell).data('field') == fieldId){
                    fieldValue = jQuery(fieldcell).text();
                }
            });
            jQuery(staticFields).each(function(counter,field){
                if(field['id'] == fieldId){
                    field.prop = fieldProperty;
                    field.value = fieldValue;
                }
            });
        });
        //add the static Fields Object to our Metadata Collection Object
        if(staticFields.length > 0){
            metaData.staticFields = staticFields;
        }
        //iterate over every cell to save position and value for dimension cells
        jQuery('div.cell').each(function(){
            //select dimension Cells
            if(jQuery(this).attr('class').indexOf('dimensionCell') != -1){
                var cell = {
                    cellRow : this.id.split('-')[0],
                    cellCol : this.id.split('-')[1],
                    cellValue : jQuery(this).text()
                };
                cell.cellDimension = jQuery(this).data('dimension');
                //add the cell coordiantes to the dimension
                jQuery(dimensions).each(function(counter,dim){
                    if(dim['id'] == cell['cellDimension']){
                        dim.cells.push(cell);
                    }
                });
            }
        });
        // add dimensions cells to mapping Data
        metaData.dimensions = dimensions;
        //calculate the offset, initiate as 0
        metaData.offset = 0;
        //iterate Table Rows from horizontal Dimension upwards
        for (var i = metaData.dimensions[0].cells[0].cellRow; i >= 0; i--){
            var rowIsFilled = true;
            //check every relevant (dimension) column for a cell value in every Row of dim[0]
            jQuery.each(dimensions[0].cells,function(key,cell){
                if(jQuery('#'+i+'-'+cell.cellCol).text().length == 0){
                    rowIsFilled = false;
                }
            });
            jQuery.each(dimensions,function(key,dim){
                if(key == 0){
                    return true;
                }
                if(jQuery('#'+i+'-'+dim.cells[0].cellCol).text().length == 0){
                    rowIsFilled = false;
                }
            });
            if(rowIsFilled){
                metaData.offset += 1;
            }
        }
        jQuery('#' + config.messageFieldDivId).html('Your Input seems to be valid, Metadata is saved!');
        var mappingString = JSON.stringify(metaData);
        return mappingString;
    };
    var sanityCheck = function(metaData,dimensions){
        //checking for DataSet, DataStructureDefinition and Measure
        if(_checkurl(jQuery('#ObservationUri').val()) == false || jQuery('#ObservationUri').val().length <= 0){
            jQuery('#' + config.messageFieldDivId).html('Please enter a valid Base Uri for the Observations.');
            return false;
        }
        if(_checkurl(jQuery('#DataSetUri').val()) == false || jQuery('#DataSetUri').val().length <= 0){
            jQuery('#' + config.messageFieldDivId).html('Please enter a valid DataSet URI.');
            return false;
        }
        if(_checkurl(jQuery('#DataStructureDefinitionUri').val()) == false || jQuery('#DataStructureDefinitionUri').val().length <= 0){
            jQuery('#' + config.messageFieldDivId).html('Please enter a valid DataStructureDefinition URI.\n');
            return false;
        }
        if(_checkurl(jQuery('#MeasureUri').val()) == false || jQuery('#MeasureUri').val().length <= 0){
            jQuery('#' + config.messageFieldDivId).html('Please enter a valid measure URI.');
            return false;
        }
        //for every dimension: check if it has a label and if it has a dimension cell
        var dimensionError;
        var dimension1RowError;
        var dimension1Row;
        jQuery.each(dimensions,function(key,dim){
            var dimensionCellexists = false;
            jQuery.each(jQuery('input.dimensionInputField'),function(key,field){
                if((jQuery(field).attr('id') == dim['id'] && jQuery(field).val().length == 0 )||
                    (jQuery(field).attr('id') == dim['id'] && !_checkurl(jQuery(field).val()))){
                    jQuery('#' + config.messageFieldDivId).html('Please configure URI of '+dim['id']+'.');
                    dimensionError = true;
                }
            });
            jQuery.each(jQuery('div.cell'),function(key,cell){
                //check if it is a dimension Cell
                if(jQuery(cell).attr('class').indexOf('dimensionCell') != -1){
                    //check if its the corresponding dimension Cell
                    if(jQuery(cell).data('dimension') == dim['id']){
                        dimensionCellexists = true;
                        if(dim['id'] == 'dimension1'){
                            if(dimension1Row == null){
                                dimension1Row = cell.id.split('-')[0];
                            }else if(dimension1Row != cell.id.split('-')[0]){
                                dimension1RowError = true;
                            }
                        }
                    }
                }
            });
            if(dimensionCellexists == false){
                jQuery('#' + config.messageFieldDivId).html('Please mark '+dim['id']+' in the Table.');
                dimensionError = true;
            }else if(dimension1RowError == true){
                jQuery('#' + config.messageFieldDivId).html('All Dimension Elements of Dimension1 have to be in the same Row.');
                dimensionError = true;
            }
        });
        var staticFieldError;
        //for every static field: check if it has a property and a staticFieldCell
        jQuery('input.staticFieldInput').each(function(key,field){
            if(jQuery(field).val() == 0 || !_checkurl(jQuery(field).val())){
                jQuery('#' + config.messageFieldDivId).html('Please configure a valid URI as Property for '+jQuery(field).attr('id')+'.');
                staticFieldError = true;
            }
            var fieldCellExists = false;
            jQuery.each(jQuery('.staticFieldCell'), function(key,fieldcell){
                if(jQuery(fieldcell).data('field') == jQuery(field).attr('id')){
                    fieldCellExists = true;
                }
            });
            if(fieldCellExists == false){
                jQuery('#' + config.messageFieldDivId).html('Please mark '+jQuery(field).attr('id')+' in the Table.');
                staticFieldError = true;
            }
        });
        if(dimensionError == true || staticFieldError == true){
            return false;
        }
        return true;
    };
    return {
        sanityCheck : sanityCheck,
        gatherMetadata : gatherMetadata
    }
})();
