# Snowflake Flask App - Azure Deployment

This repository contains a Flask application that displays database information from a Snowflake database, deployed on Azure Functions.

## Enhanced Visualizations

### Homepage (/)
The homepage features a dual-layer visualization:
1. **Vega-Lite Chart**: A bar chart showing name counts from the Snowflake database
2. **Three.js Background Animation**: A dynamic background with falling data sprites representing database entries. The animation creates a sense of data flow and adds visual interest to the page.

### HardData Page (/HardData)
The HardData page has been completely overhauled with an interactive 3D visualization:
1. **Interactive 3D Cards**: Each database record is represented as a 3D card in a Three.js scene
2. **Drag Controls**: Users can click and drag cards to rearrange them in 3D space
3. **Orbit Controls**: Users can rotate and zoom the camera to explore the data from different angles

## Deployment

This application is deployed on Azure using:
- **Azure Functions**: Serverless compute service
- **Azure Function App**: HTTP-triggered function app

### Prerequisites
- Azure CLI
- Azure Functions Core Tools
- Python 3.9+
- Snowflake account with proper credentials

### Deployment Steps
1. Configure your Azure credentials:
   ```
   az login
   ```

2. Create a Function App:
   ```
   az functionapp create --resource-group YourResourceGroup --consumption-plan-location YourRegion --runtime python --runtime-version 3.9 --functions-version 4 --name snow-flask-whoami-az --storage-account YourStorageAccount
   ```

3. Configure application settings:
   ```
   az functionapp config appsettings set --name snow-flask-whoami-az --resource-group YourResourceGroup --settings USERNAME=your_snowflake_username PASSWORD=your_snowflake_password REGION=your_snowflake_region
   ```

4. Deploy the function:
   ```
   func azure functionapp publish snow-flask-whoami-az
   ```

## Local Development

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set environment variables:
   ```
   export USERNAME=your_snowflake_username
   export PASSWORD=your_snowflake_password
   export REGION=your_snowflake_region
   ```

3. Run locally:
   ```
   func start
   ```

## Live Demo
The application is deployed at: https://snow-flask-whoami-az.azurewebsites.net/Home
