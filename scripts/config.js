var config = (function() {
    return {
        phpOrigin : './eventHandler.php',
        csvFileAreaDiv : 'csvFileArea',
        tableDivId : 'tableDisplay',
        dimensionsDivId : 'dimensions',
        staticFieldsDivId: 'staticFields',
        messageFieldDivId : 'messagefield',
        tarqlMappingDivId : 'tarqlMapping',
        validationResultDivId : 'validationResult',
        dataCubeDivId : 'dataCube',
        delimiter: 'delimiter',
        quotechar: 'quotechar',
        tarqlConfig : {
            prefixString :
            'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n' +
            'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
            'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n' +
            'PREFIX qb: <http://purl.org/linked-data/cube#>\n' +
            'PREFIX dct: <http://purl.org/dc/terms/>\n' +
            'PREFIX sdmx-attribute: <http://purl.org/linked-data/sdmx/2009/attribute#>\n' +
            'PREFIX sdmx-measure: <http://purl.org/linked-data/sdmx/2009/measure#>\n'
        }
    }
})();
