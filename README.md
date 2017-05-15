# CSV-to-DataCube-Mapping-Generator
This project is aiming to create a reusable mapping from CSV to RDF DataCube and is part of my master thesis. As mapping language, [Tarql](https://github.com/tarql/tarql/wiki/TARQL-Mapping-Language) is used.

# Deploy

This project can be deployed via docker-compose:

```
docker-compose up
```

# Mappinggenerator

After the deploy, the GUI of the Mappinggenerator can be found under:
```
localhost:8080
```

# Transformation Pipeline
The Transformation Pipeline is integrated into the Mappinggenerator and can also be used via the commandline under `transform.sh` after deploying the project.

# DataCube Validator
The DataCube Validator is also integrated into the Mappinggenerator and can also be used via the commandline under `validate.sh` after deploying the project.

# License

This project is under [Creative Commons Attribution-ShareAlike 4.0 License](https://creativecommons.org/licenses/by-sa/4.0/legalcode).
