#!/usr/bin/env bash
##read in variables
# Transform long options to short ones
for arg in "$@"; do
    shift
    case "$arg" in
        "--csvfile") set -- "$@" "-c" ;;
        "--mappingfile") set -- "$@" "-m" ;;
        "--delimiter") set -- "$@" "-d" ;;
        "--quotechar") set -- "$@" "-q" ;;
        "--format") set -- "$@" "-f" ;;
        *)        set -- "$@" "$arg"
    esac
done
#default values
delimiter=','
quotechar='"'
# Parse short options
while getopts "c:m:d:q:f:" opt; do
    case $opt in
        c) csvfile=${OPTARG} ;;
        m) mappingfile=${OPTARG} ;;
        d) delimiter=${OPTARG} ;;
        q) quotechar=${OPTARG} ;;
        f) format=${OPTARG} ;;
        ?) exit 1 ;;
    esac
done
##validate variables to catch errors
if [ -z "$csvfile" -o -z "$mappingfile" -o -z "$delimiter" -o -z "$quotechar" -o -z "$format" ] || [ ! -r $csvfile -o ! -r $mappingfile ] \
    || ! [ "$format" == "turtle" -o "$format" == "rdfxml" -o "$format" == "ntriples" -o "$format" == "json" ]
then
    echo -e "One or more of the required arguments is missing \nplease use     transform.sh
    required arguments:
    --csvfile [ readable csv input file ]
    --mappingfile [ readable mapping file ]
    --format your output format [ turle | rdfxml | ntriples | json ]
    optional arguments:
    --delimiter : [delimiter of the csv file; default: , ]
    --quotechar : [quotechar of the csv file; default: \" ]"
    exit 1
fi

#copy files to docker container (upload folder)
eval docker cp $csvfile mappingGeneratorSystems:/uploads/csvFile
eval docker cp $mappingfile mappingGeneratorSystems:/uploads/mappingFile
#function to generate temporary files
tempfile() {
    tempprefix=$(basename "$0")
    mktemp /tmp/${tempprefix}.XXXXXX
}
#call tarql and save the result
tarqlResult=$(tempfile)
eval docker exec mappingGeneratorSystems /tarql/target/appassembler/bin/tarql -H -q -d \\$delimiter --quotechar \\$quotechar /uploads/mappingFile /uploads/csvFile > $tarqlResult
#upload tarql result
eval docker cp $tarqlResult mappingGeneratorSystems:/uploads/tarqlResult
#call rapper and save the result
rapperResult=$(tempfile)
eval docker exec mappingGeneratorSystems rapper -q -e -i turtle -o $format /uploads/tarqlResult > $rapperResult
#print result
cat $rapperResult
#remove files from /upload
eval docker exec mappingGeneratorSystems rm /uploads/csvFile
eval docker exec mappingGeneratorSystems rm /uploads/mappingFile
eval docker exec mappingGeneratorSystems rm /uploads/tarqlResult
rm -f $tarqlResult $rapperResult
