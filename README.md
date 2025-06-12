# Snowflake Flask App - Azure Functions Deployment

A serverless Flask application deployed on Azure Functions with HTTP triggers, featuring interactive Three.js visualizations and real-time Snowflake database connectivity.

## 🚀 Live Application
**URL**: https://snow-flask-whoami-az.azurewebsites.net/

## ✨ Features

### Interactive Visualizations
- **Homepage (`/`)**: Dual-layer visualization combining:
  - Vega-Lite bar chart displaying name counts from Snowflake database
  - Three.js background animation with falling data sprites creating visual data flow
- **HardData Page (`/HardData`)**: Immersive 3D data exploration:
  - Interactive 3D cards representing individual database records
  - Drag controls for spatial manipulation of data elements
  - Orbital camera controls for comprehensive 360° data exploration

### Technical Architecture
- **Compute**: Azure Functions (serverless Python runtime)
- **Trigger**: HTTP trigger with Flask integration
- **Authentication**: RSA key-pair authentication with Snowflake
- **Hosting**: Azure App Service consumption plan

## 🏗️ Azure Infrastructure

### Services Used
| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Azure Functions** | Serverless compute | Python 3.11 runtime, HTTP trigger |
| **App Service Plan** | Hosting platform | Consumption-based pricing |
| **Storage Account** | Function metadata | General-purpose v2 storage |
| **Application Insights** | Monitoring & logging | Performance monitoring |

## 📋 Prerequisites

- **Azure CLI** (v2.30+) - [Installation Guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- **Azure Functions Core Tools** (v4.x) - [Installation Guide](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- **Python 3.11+** with pip
- **Snowflake account** with database access
- **Azure subscription** with appropriate permissions

## 🔧 Installation & Deployment

### 1. Environment Setup
```bash
# Login to Azure
az login

# Set your subscription (if multiple subscriptions)
az account set --subscription "Your-Subscription-ID"

# Verify Azure configuration
az account show
```

### 2. Clone and Prepare
```bash
git clone https://github.com/HatmanStack/snow-flask-whoami.git
cd snow-flask-whoami/snow-flask-whoami-az/
```

### 3. Configure Snowflake Authentication
```bash
# Generate RSA key pair (if not already done)
openssl genrsa 2048 | openssl pkcs8 -topk8 -inform PEM -out rsa_key.p8 -v2 aes-256-cbc -passout pass:your-passphrase
openssl rsa -in rsa_key.p8 -passin pass:your-passphrase -pubout -out rsa_key.pub

# Configure Snowflake user with public key
# In Snowflake SQL worksheet:
# ALTER USER your_service_user SET RSA_PUBLIC_KEY = '<public_key_content>';
```

### 4. Create Azure Resources
```bash
# Create resource group
az group create --name snow-flask-rg --location eastus

# Create storage account
az storage account create \
  --name snowflaskstorageacct \
  --resource-group snow-flask-rg \
  --location eastus \
  --sku Standard_LRS

# Create Function App
az functionapp create \
  --resource-group snow-flask-rg \
  --consumption-plan-location eastus \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4 \
  --name snow-flask-whoami-az \
  --storage-account snowflaskstorageacct \
  --os-type Linux
```

### 5. Configure Application Settings
```bash
# Set Snowflake connection parameters
az functionapp config appsettings set \
  --name snow-flask-whoami-az \
  --resource-group snow-flask-rg \
  --settings 
  --settings \
    FUNCTIONS_WORKER_RUNTIME=python \
    SNOW_USERNAME="your_snowflake_username" \
    SNOW_PASSWORD="your_private_key_passphrase" \
    SNOW_ACCOUNT="your_snowflake_account"
```

### 6. Deploy Function
```bash
# Install local dependencies
pip install -r requirements.txt

# Deploy to Azure
func azure functionapp publish snow-flask-whoami-az
```

## 💻 Local Development

### Environment Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt
```

### Local Configuration
Create `local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "SNOW_USERNAME": "your_snowflake_username",
    "SNOW_PASSWORD": "your_private_key_passphrase",
    "SNOW_ACCOUNT": "your_snowflake_region"
  }
}
```

### Local Testing
Install Azure Functions Core Tools: https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local
```bash
# Start Azure Functions runtime locally
func start

# Test specific endpoints
curl http://localhost:7071/api/Home
curl http://localhost:7071/api/HardData
```

## 📊 Monitoring & Troubleshooting

### Application Insights
```bash
# View live metrics
az monitor app-insights component show \
  --app snow-flask-whoami-az \
  --resource-group snow-flask-rg

# Query application logs
az monitor app-insights query \
  --app snow-flask-whoami-az \
  --analytics-query "requests | limit 10"
```

### Function Logs
```bash
# Stream live logs
func azure functionapp logstream snow-flask-whoami-az

# View function execution history
az functionapp log deployment list \
  --name snow-flask-whoami-az \
  --resource-group snow-flask-rg
```

### Common Issues
- **Cold Start Delays**: First request may take 10-15 seconds
- **Memory Constraints**: Monitor memory usage in Application Insights
- **Timeout Limits**: Default 5-minute timeout for consumption plan
- **Package Size**: Keep deployment package under 1GB

## 🗂️ Project Structure
```
snow-flask-whoami-az/
├── __init__.py             # Python package marker
├── function.json           # Function binding configuration
├── host.json              # Function app host configuration
├── requirements.txt        # Python dependencies
├── rsa_key.p8             # Snowflake private key
├── static/                # Frontend assets
│   ├── cards.js          # 3D card interactions
│   └── threejs-background.js # Background animations
└── templates/             # Jinja2 HTML templates
    ├── index.html        # Homepage with charts
    ├── charts.html       # Data visualization page
    ├── submit.html       # Data entry form
    └── thanks4submit.html # Confirmation page
```

## 🔐 Security Considerations

- **Snowflake Credentials**: Stored in Azure Function App Settings (encrypted)
- **RSA Keys**: Private key encrypted with passphrase
- **HTTPS**: Enforced by default on Azure Functions
- **Authentication**: Consider Azure AD integration for production
- **Network Security**: VNet integration available for premium plans

## 💰 Cost Optimization

- **Consumption Plan**: Pay-per-execution model
- **Free Tier**: 1M executions and 400k GB-seconds free monthly
- **Cold Start**: Consider Premium plan for consistent performance
- **Estimated Monthly Cost**: <$10 for moderate usage

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Azure Functions
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: pip install -r requirements.txt
    - name: Deploy to Azure Functions
      uses: Azure/functions-action@v1
      with:
        app-name: snow-flask-whoami-az
        package: .
        publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
```

## 🔧 Advanced Configuration

### Premium Plan Benefits
- No cold start delays
- VNet connectivity
- Unlimited execution duration
- Predictable pricing

### Scaling Configuration
```bash
# Configure scaling settings
az functionapp config set \
  --name snow-flask-whoami-az \
  --resource-group snow-flask-rg \
  --prewarmed-instance-count 1
```


### Notes
Azure Function deployment differs from other major serverless cloud providers.  They have a two tiered system to manage the app in the root folder and then build and deploy the app from function folders usting something like the vercel/react router naming conventions using folders. Make sure to make the necessary changes to folders(static/templates) and security files to reflect that. eg. 
```bash
KEY_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'rsa_key.p8'))
```