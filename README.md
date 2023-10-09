# Who Am I : AZ

This is the Azure version of Who Am I.  It uses Azure Functions to build a microservice with Flask that provides an API for querying and posting information to a Snowflake Database.  The information is displayed with interactive Vega-Lite visualizations.

## Changes

The service is built and deployed using VSCode. When using Azure Functions it's necessary to rename your entrypoint to function_app.py and flatten the directory structure.  Rendering templates doesn't work off the shelf in Azure Functions.  The workaround is to read the .html as a string replacing the relevant parts.

## Local Development

To run locally:

Running Azure functions locally is not straightforward.  It's necessary to have the vscode extension, Azurite, installed to simulate azure cloud storage. Microsoft learn is great [here]("https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-vs-code"). 

Remember to replace `REGION`, `USER`, `PASSWORD` with your own Snowflake credentials and match the Schema to the one provided. You can add these env variables in the configuration once the function is deployed. 


