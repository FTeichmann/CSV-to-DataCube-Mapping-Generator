import java.io.File;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.Scanner;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.util.FileManager;
import org.apache.jena.query.*;
import org.apache.log4j.varia.NullAppender;

public class CubeValidator {
	@SuppressWarnings("resource")
	public static void main (String args[]) {
		if(args == null || args.length < 2){
			throw new IllegalArgumentException("Please use java -jar cubeFile queryFolder");
		}
		String cubeFile = args[0];
		String queryBasePath = args[1];
    	//deactivate log4j logging
		org.apache.log4j.BasicConfigurator.configure(new NullAppender());
        // create an empty model
        Model model = ModelFactory.createDefaultModel();
        InputStream cube = FileManager.get().open(cubeFile);
        if (cube == null) {
            throw new IllegalArgumentException( "CubeFile not found");
        }        
        // read the RDF/XML file
        model.read(cube, "");
        for(int i=1; i < 22; i++){
        	System.out.println("Checking integrity constraint "+ i);
        	String queryString = "";
    		try {
    			queryString = new Scanner(new File(queryBasePath + "/integrityTest"+i+".sparql")).useDelimiter("\\Z").next();
    		} catch (FileNotFoundException e) {
    			e.printStackTrace();
    		}
    		Query query = QueryFactory.create(queryString);
            try (QueryExecution qexec = QueryExecutionFactory.create(query, model)){
            	boolean results = qexec.execAsk();            	
            	qexec.close();
            	if(results == false){
            		System.out.println("Test passed.");
            	}else{
            		System.out.println("Test failed, query:");
            		System.out.println(queryString);
            	}
            }
    	}
	}
}