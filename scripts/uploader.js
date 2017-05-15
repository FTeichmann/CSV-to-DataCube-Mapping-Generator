var uploader = (function(){
    var loadFile = function(event){
        var csvFile = event.target.files[0];
        var fileReader = new FileReader();
        fileReader.onload = function(){
            jQuery('#'+config.csvFileAreaDiv).val(fileReader.result);
        };
        fileReader.readAsText(csvFile);
    };
    var upload = function(){
        // Create a formdata object and add the csvFile
        if(jQuery('#'+config.csvFileAreaDiv).val().length == 0){
            jQuery('#' + config.messageFieldDivId).html('Please choose a File for the Upload or paste the CSV Content.');
        }else{
            var formdata = new FormData();
            formdata.append('csvData',jQuery('#'+config.csvFileAreaDiv).val());
            formdata.append('delimiter',jQuery('#'+config.delimiter).val());
            formdata.append('quotechar',jQuery('#'+config.quotechar).val());
            jQuery.ajax({
                url: config.phpOrigin + '?action=csvFileUpload',
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
                            jQuery('#'+config.messageFieldDivId).html('Something went wrong, Server could not find your Document.')
                        }else{
                            //start generating output table
                            var output = "<table id=\"deliverable_table\" class=\"display table table-bordered\">\n<tbody>\n";
                            jQuery.each(response, function(row,element){
                                output += "<tr>\n"
                                jQuery.each(element, function(col,cell){
                                    output += "<td><div class=\"cell\" id=\"" + (row + 1) + "-" + (col + 1) + "\">" + cell + "</div></td>\n";
                                });
                                output += "</tr>\n";
                            });
                            output += "</tbody>\n</table>\n";
                        };
                        jQuery('#'+config.tableDivId).html(output);//print html
                        jQuery('#'+config.messageFieldDivId).html("CSV Data uploaded, please configure your Metadata and press 'validate Input'.")
                    }else{
                        // handling of specific php errors
                        console.log('ERRORS: ' + response.error);
                    }
                },
                // handling of connection / ajax errors
                error: function(jqXHR, textStatus, errorThrown){
                    console.log('ERRORS: ' + textStatus);
                },
            });
        }
    };
    return{
        loadFile : loadFile,
        upload : upload
    }
})();
