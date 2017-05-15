var tarqlModule = (function(){
    var generateTarqlMapping = function(mappingString){
        mappingString = JSON.parse(mappingString);
        //adding prefixes
        var tarqlMapping = config.tarqlConfig.prefixString;
        //starting Construct statement
        tarqlMapping += 'CONSTRUCT {\n' +
        //adding DataSet Statements
        '<' + mappingString.DataSetUri + '>' + ' \n' +
        '  dct:issued "' + _getDate() +'"^^xsd:date ;\n' +
        '  dct:generatedBy "DataCube Mapping Creator";\n' +
        '  qb:structure ' + '<' + mappingString.DataStructureDefinitionUri + '>' + ' ;\n';
        //adding static fields
        jQuery.each(mappingString.staticFields,function(key,field){
            tarqlMapping += '   <' + field.prop + '> \"' + field.value + '\" ;\n';
        });
        tarqlMapping += '  a qb:DataSet .\n';
        //adding the Data Structure Definition (dsd)
        tarqlMapping += '<' + mappingString.DataStructureDefinitionUri + '>' + '\n' +
        '  qb:attribute sdmx-attribute:unitMeasure ;\n' +
        '  qb:componentAttachment qb:DataSet ;\n'+
        '  a qb:DataStructureDefinition .\n';
        var componentCounter = 0;
        jQuery.each(mappingString.dimensions,function(key,dimension){
            componentCounter++;
            tarqlMapping += '<' + mappingString.DataStructureDefinitionUri + 'component' + componentCounter + '> \n' +
            '  a qb:ComponentSpecification ;\n' +
            '  qb:componentProperty ' + '<' + dimension.uri + '>' + ' ;\n' +
            '  qb:dimension ' + '<' + dimension.uri + '>' + ' . \n';
        });
        componentCounter++;
        tarqlMapping += '<' + mappingString.DataStructureDefinitionUri + 'component' + componentCounter + '> \n' +
        '  a qb:ComponentSpecification ;\n' +
        '  qb:componentProperty ' + '<' + mappingString.MeasureUri + '>' + ' ;\n' +
        '  qb:measure ' + '<' + mappingString.MeasureUri + '>' + ' ;\n' +
        '  qb:componentRequired "true"^^xsd:boolean .\n';
        for(var h = 1; h <= componentCounter; h++){
            tarqlMapping += '<' + mappingString.DataStructureDefinitionUri + '> qb:component <' + mappingString.DataStructureDefinitionUri + 'component' + h + '> .\n';
        }
        //adding measure components
        tarqlMapping += '<' + mappingString.MeasureUri + '>' + '\n' +
        '  a qb:MeasureProperty, rdf:Property ;\n' +
        '  rdfs:subPropertyOf sdmx-measure:obsValue .\n';
        //defining dimensions
        jQuery.each(mappingString.dimensions,function(key,dimension){
            tarqlMapping += '<' + dimension.uri + '>' + '\n' +
            '  a qb:DimensionProperty, rdf:Property ;\n' +
            //TODO:Range could be defined better
            '  rdfs:range <' + dimension.uri + '/range> .\n';
        });
        //observations
        //dimensions[0] is the horizontal dimension
        for(var i = 0; i < mappingString.dimensions[0].cells.length; i++){
            tarqlMapping += '?placeholder' + (i + 1) + '\n' +
            '  qb:dataSet ' + '<' + mappingString.DataSetUri + '>' + ' ;\n' +
            '  a qb:observation; \n';
            //adding mappingString.dimensions[0].cells[i].cellValue -> the column heading
            tarqlMapping += '  <' + mappingString.dimensions[0].uri  + '> "'+ mappingString.dimensions[0].cells[i].cellValue + '";\n';
            //add every vertical dimension
            for(var j = 1; j < mappingString.dimensions.length; j++){
                tarqlMapping += '  <' + mappingString.dimensions[j].uri  + '>'+ ' ?' + _getHeaderFromNumber(mappingString.dimensions[j].cells[0].cellCol) + ';\n';
            }
            tarqlMapping += '  <' + mappingString.MeasureUri + '>' + ' ?' + _getHeaderFromNumber(mappingString.dimensions[0].cells[i].cellCol) + '.\n';
        }
        //adding FROM placeholder for the csv file
        tarqlMapping += '} \n FROM <FILEPLACEHOLDER> \n';
        //binding variables
        tarqlMapping += 'WHERE {\n';
        for(var i = 0; i < mappingString.dimensions[0].cells.length; i++){
            tarqlMapping += 'BIND( URI(CONCAT(\'' + mappingString.ObservationUri +
            '\',\''+ mappingString.dimensions[0].cells[i].cellValue + '\'';
            for(var j = 1; j < mappingString.dimensions.length; j++){
                tarqlMapping += ',\'_\',?' + _getHeaderFromNumber(mappingString.dimensions[j].cells[0].cellCol);
            }
            tarqlMapping += ')) as ?placeholder' + (i+1) + ')\n';
        }
        tarqlMapping += '  FILTER(';
        tarqlMapping += 'BOUND(?' + _getHeaderFromNumber(mappingString.dimensions[0].cells[0].cellCol) + ')';
        for (var i = 1; i < mappingString.dimensions[0].cells.length; i++){
            tarqlMapping += ' && BOUND(?' + _getHeaderFromNumber(mappingString.dimensions[0].cells[i].cellCol) + ')';
        }
        for(var i = 1; i < mappingString.dimensions.length; i++){
            tarqlMapping += ' && BOUND(?' + _getHeaderFromNumber(mappingString.dimensions[i].cells[0].cellCol) + ')';
        }
        tarqlMapping += ')\n}\nOFFSET '+mappingString.offset;
        return tarqlMapping;
    };
    return {
        generateTarqlMapping : generateTarqlMapping
    }
})();
