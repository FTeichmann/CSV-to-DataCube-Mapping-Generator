#!/usr/bin/env bash
##read in variables
# Transform long options to short ones
for arg in "$@"; do
    shift
    case "$arg" in
        "--cubefile") set -- "$@" "-c" ;;
        "--format") set -- "$@" "-f" ;;
        *)        set -- "$@" "$arg"
    esac
done
# Parse short options
while getopts "c:m:d:q:f:" opt; do
    case $opt in
        c) cubefile=${OPTARG} ;;
        f) format=${OPTARG} ;;
        ?) exit 1 ;;
    esac
done
##validate variables to catch errors
if [ -z "$cubefile" ] || [ ! -r $cubefile ] || ! [ "$format" == "turtle" -o "$format" == "rdfxml" -o "$format" == "ntriples" -o "$format" == "json" ]
then
    echo -e "One or more of the required arguments is missing \nplease use     validate.sh
    required arguments:
    --cubefile [ readable dataCube file ]
    --format of your cubefile [ turle | rdfxml | ntriples | json ]"
    exit 1
fi

#copy files to docker container (upload folder)
eval docker cp $cubefile mappingGeneratorSystems:/uploads/cubeFile
tempfile() {
    tempprefix=$(basename "$0")
    mktemp /tmp/${tempprefix}.XXXXXX
}
#call tarql and save the result
rapperResult=$(tempfile)
#transform cubefile to rdfxml
eval docker exec mappingGeneratorSystems rapper -q -i $format -o rdfxml /uploads/cubeFile > $rapperResult
eval docker cp $rapperResult mappingGeneratorSystems:/uploads/cubeFileXML
#call cube validator
eval docker exec mappingGeneratorSystems java -jar /application/CubeValidator/bin/CubeValidator.jar /uploads/cubeFileXML /application/CubeValidator/validationQueries
#remove files from /upload
eval docker exec mappingGeneratorSystems rm /uploads/cubeFile
rm -f $rapperResult
