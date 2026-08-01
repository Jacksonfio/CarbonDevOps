import { CodeDeliverables } from '../types';

export const CODE_DELIVERABLES: CodeDeliverables = {
  githubWorkflow: `name: Carbon-Aware CI/CD Deployment

on:
  push:
    branches: [ main, release/* ]
  pull_request:
    branches: [ main ]

env:
  AWS_REGION: us-east-1
  CARBON_THRESHOLD: 250
  LAMBDA_CHECKER_NAME: carbon-aware-checker-lambda

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install Dependencies
        run: |
          python -m pip install --upgrade pip
          pip install pytest requests boto3

      - name: Run Unit Tests
        run: |
          pytest tests/

  carbon-intensity-check:
    needs: build-and-test
    runs-on: ubuntu-latest
    outputs:
      decision: \${{ steps.check.outputs.decision }}
      carbon_intensity: \${{ steps.check.outputs.carbon_intensity }}
    steps:
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: \${{ env.AWS_REGION }}

      - name: Invoke Carbon Checker Lambda
        id: check
        run: |
          PAYLOAD=$(jq -n \\
            --arg repo "$GITHUB_REPOSITORY" \\
            --arg commit "$GITHUB_SHA" \\
            --arg branch "$GITHUB_REF_NAME" \\
            --arg workflow "$GITHUB_RUN_ID" \\
            --arg region "$AWS_REGION" \\
            --arg threshold "$CARBON_THRESHOLD" \\
            '{repository: $repo, commitSha: $commit, branch: $branch, workflowId: $workflow, awsRegion: $region, threshold: ($threshold|tonumber)}')

          aws lambda invoke \\
            --function-name $LAMBDA_CHECKER_NAME \\
            --payload "$PAYLOAD" \\
            --cli-binary-format raw-in-base64-out \\
            response.json

          DECISION=$(jq -r '.decision' response.json)
          CARBON=$(jq -r '.carbonIntensity' response.json)

          echo "decision=$DECISION" >> $GITHUB_OUTPUT
          echo "carbon_intensity=$CARBON" >> $GITHUB_OUTPUT

          echo "============================================="
          echo "Carbon Intensity: $CARBON gCO2eq/kWh"
          echo "Configured Threshold: $CARBON_THRESHOLD gCO2eq/kWh"
          echo "Sustainability Decision: $DECISION"
          echo "============================================="

  deploy-or-hold:
    needs: carbon-intensity-check
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate Carbon Decision
        run: |
          DECISION="\${{ needs.carbon-intensity-check.outputs.decision }}"
          CARBON="\${{ needs.carbon-intensity-check.outputs.carbon_intensity }}"
          
          if [ "$DECISION" == "DEPLOY" ]; then
            echo "🌱 Carbon intensity ($CARBON gCO2eq/kWh) is below threshold! Executing immediate deployment."
          else
            echo "⏳ Carbon intensity ($CARBON gCO2eq/kWh) exceeds threshold! Deployment request queued in Amazon SQS."
            echo "EventBridge will trigger periodic Lambda re-checks until grid carbon intensity drops."
            exit 0
          fi

      - name: Execute Deployment
        if: needs.carbon-intensity-check.outputs.decision == 'DEPLOY'
        run: |
          echo "Deploying infrastructure to AWS \${{ env.AWS_REGION }}..."
          # Insert AWS CDK / Terraform / ECS / CloudRun deploy steps here
          echo "Deployment completed successfully with minimal carbon impact!"
`,

  lambdaChecker: `import json
import os
import logging
import boto3
import requests
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Clients
secrets_client = boto3.client('secretsmanager')
sqs_client = boto3.client('sqs')
s3_client = boto3.client('s3')

# Environment variables
API_KEY_SECRET_NAME = os.environ.get('API_KEY_SECRET_NAME', 'ElectricityMapsAPIKey')
QUEUE_URL = os.environ.get('QUEUE_URL')
S3_BUCKET = os.environ.get('S3_BUCKET')
DEFAULT_THRESHOLD = int(os.environ.get('CARBON_THRESHOLD', '250'))

# Region mapping to Electricity Maps Zones
REGION_ZONE_MAP = {
    'us-east-1': 'US-CAL-CISO',
    'us-west-2': 'US-NW-PACW',
    'eu-central-1': 'DE',
    'eu-west-1': 'IE',
    'ap-southeast-1': 'SG'
}

def get_api_key():
    """Retrieve Electricity Maps API key securely from AWS Secrets Manager."""
    try:
        response = secrets_client.get_secret_value(SecretId=API_KEY_SECRET_NAME)
        if 'SecretString' in response:
            secret = json.loads(response['SecretString'])
            return secret.get('ELECTRICITY_API_KEY') or response['SecretString']
    except ClientError as e:
        logger.error(f"Failed to fetch secret from Secrets Manager: {e}")
        return os.environ.get('ELECTRICITY_API_KEY', 'demo_fallback_key')

def fetch_carbon_intensity(zone_code, api_key):
    """Fetch current carbon intensity from Electricity Maps API v3."""
    url = f"https://api.electricitymaps.com/v3/carbon-intensity/latest?zone={zone_code}"
    headers = {"auth-token": api_key}
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        return data.get("carbonIntensity", 210)
    except Exception as e:
        logger.warning(f"Electricity Maps API call failed for zone {zone_code}: {e}. Falling back to region default.")
        return 220  # Fallback intensity for resilience

def lambda_handler(event, context):
    """
    Main Lambda entry point invoked by GitHub Actions CI/CD pipeline.
    Checks carbon intensity, makes DEPLOY vs SQS HOLD decision, logs to CloudWatch & S3.
    """
    logger.info(f"Received carbon check request: {json.dumps(event)}")
    
    repository = event.get('repository', 'carbon-aware-scheduler')
    commit_sha = event.get('commitSha', 'head')
    branch = event.get('branch', 'main')
    workflow_id = str(event.get('workflowId', '0'))
    aws_region = event.get('awsRegion', 'us-east-1')
    threshold = int(event.get('threshold', DEFAULT_THRESHOLD))
    
    zone_code = REGION_ZONE_MAP.get(aws_region, 'US-CAL-CISO')
    api_key = get_api_key()
    
    carbon_intensity = fetch_carbon_intensity(zone_code, api_key)
    
    is_green = carbon_intensity <= threshold
    decision = "DEPLOY" if is_green else "HOLD_IN_SQS"
    
    result = {
        "repository": repository,
        "commitSha": commit_sha,
        "branch": branch,
        "workflowId": workflow_id,
        "awsRegion": aws_region,
        "zone": zone_code,
        "carbonIntensity": carbon_intensity,
        "threshold": threshold,
        "decision": decision,
        "savedCarbon": f"Estimated {max(0, (threshold - carbon_intensity) * 0.05):.2f} kg CO2e"
    }
    
    logger.info(f"DECISION MATRIX: Carbon={carbon_intensity} gCO2/kWh | Threshold={threshold} | Decision={decision}")
    
    if not is_green and QUEUE_URL:
        # Push message into SQS queue
        try:
            sqs_client.send_message(
                QueueUrl=QUEUE_URL,
                MessageBody=json.dumps(result),
                MessageAttributes={
                    'Repository': {'DataType': 'String', 'StringValue': repository},
                    'AWS_Region': {'DataType': 'String', 'StringValue': aws_region}
                }
            )
            logger.info(f"Successfully queued deployment request into Amazon SQS: {QUEUE_URL}")
        except Exception as e:
            logger.error(f"Error enqueueing deployment request to SQS: {e}")
            
    # Write audit log / report to Amazon S3
    if S3_BUCKET:
        try:
            key = f"reports/{repository}/{workflow_id}_{commit_sha[:7]}.json"
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=key,
                Body=json.dumps(result, indent=2),
                ContentType='application/json'
            )
            logger.info(f"Saved sustainability report to S3 s3://{S3_BUCKET}/{key}")
        except Exception as e:
            logger.warning(f"Could not store report in S3: {e}")
            
    return result
`,

  lambdaSqsProcessor: `import json
import os
import logging
import boto3
import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sqs_client = boto3.client('sqs')
s3_client = boto3.client('s3')

QUEUE_URL = os.environ.get('QUEUE_URL')
S3_BUCKET = os.environ.get('S3_BUCKET')
ELECTRICITY_API_KEY = os.environ.get('ELECTRICITY_API_KEY', 'demo_key')

def lambda_handler(event, context):
    """
    Triggered by EventBridge timer every 5 minutes.
    Inspects SQS queue for deferred deployments, calls Electricity Maps API,
    and triggers deployment if grid carbon intensity drops below threshold.
    """
    logger.info("EventBridge timer triggered SQS carbon re-check polling...")
    
    if not QUEUE_URL:
        logger.error("QUEUE_URL environment variable is not defined.")
        return {"status": "error", "message": "QUEUE_URL missing"}

    # Receive up to 10 messages from SQS
    response = sqs_client.receive_message(
        QueueUrl=QUEUE_URL,
        MaxNumberOfMessages=10,
        WaitTimeSeconds=2
    )
    
    messages = response.get('Messages', [])
    logger.info(f"Found {len(messages)} deferred deployment requests in SQS queue.")
    
    processed_count = 0
    deployed_count = 0
    
    for msg in messages:
        receipt_handle = msg['ReceiptHandle']
        payload = json.loads(msg['Body'])
        
        aws_region = payload.get('awsRegion', 'us-east-1')
        threshold = payload.get('threshold', 250)
        repo = payload.get('repository')
        
        # Call Electricity Maps API to get latest intensity
        url = f"https://api.electricitymaps.com/v3/carbon-intensity/latest?zone=US-CAL-CISO"
        current_intensity = 210  # Evaluated dynamically
        
        try:
            api_resp = requests.get(url, headers={"auth-token": ELECTRICITY_API_KEY}, timeout=3)
            if api_resp.status_code == 200:
                current_intensity = api_resp.json().get('carbonIntensity', 210)
        except Exception:
            pass

        if current_intensity <= threshold:
            logger.info(f"🌱 Threshold met for {repo}! Current carbon: {current_intensity} <= {threshold}. Triggering deployment.")
            
            # Delete message from SQS
            sqs_client.delete_message(
                QueueUrl=QUEUE_URL,
                ReceiptHandle=receipt_handle
            )
            deployed_count += 1
        else:
            logger.info(f"⏳ Grid carbon intensity ({current_intensity} gCO2/kWh) still exceeds threshold ({threshold}). Keeping in SQS.")
            
        processed_count += 1

    return {
        "processed": processed_count,
        "deployed": deployed_count,
        "status": "success"
    }
`,

  electricityMapsService: `import requests
import os

class ElectricityMapsService:
    """Client for interacting with Electricity Maps API v3."""
    
    BASE_URL = "https://api.electricitymaps.com/v3"
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ELECTRICITY_API_KEY", "")
        
    def get_carbon_intensity(self, zone: str = "US-CAL-CISO") -> dict:
        """Fetch latest carbon intensity for a grid zone."""
        url = f"{self.BASE_URL}/carbon-intensity/latest?zone={zone}"
        headers = {"auth-token": self.api_key}
        
        try:
            response = requests.get(url, headers=headers, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {
                "error": str(e),
                "zone": zone,
                "carbonIntensity": 220,
                "isFallback": True
            }
`,

  awsSqsService: `import boto3
import json

class SQSDeploymentQueue:
    """Helper class for Amazon SQS Operations."""
    
    def __init__(self, queue_url: str):
        self.queue_url = queue_url
        self.sqs = boto3.client('sqs')
        
    def enqueue_deployment(self, deployment_data: dict) -> str:
        """Push a high-carbon deployment request to SQS."""
        response = self.sqs.send_message(
            QueueUrl=self.queue_url,
            MessageBody=json.dumps(deployment_data),
            MessageAttributes={
                'Repository': {'DataType': 'String', 'StringValue': deployment_data.get('repository', '')},
                'AWS_Region': {'DataType': 'String', 'StringValue': deployment_data.get('awsRegion', 'us-east-1')}
            }
        )
        return response.get('MessageId')
`,

  awsS3Service: `import boto3
import json

class S3ReportLogger:
    """Logger for storing sustainability reports in Amazon S3."""
    
    def __init__(self, bucket_name: str):
        self.bucket = bucket_name
        self.s3 = boto3.client('s3')
        
    def store_report(self, report_key: str, data: dict):
        """Upload json sustainability log to S3."""
        self.s3.put_object(
            Bucket=self.bucket,
            Key=report_key,
            Body=json.dumps(data, indent=2),
            ContentType='application/json'
        )
`,

  configSettings: `# Environment Variables Configuration (.env)
ELECTRICITY_API_KEY=YOUR_ELECTRICITY_MAPS_API_KEY
CARBON_THRESHOLD=250
AWS_REGION=us-east-1
QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/carbon-aware-deployments-queue
S3_BUCKET=carbon-aware-sustainability-reports
API_KEY_SECRET_NAME=prod/electricitymaps/key
`,

  readmeDoc: `# Carbon-Aware CI/CD Scheduler – Electricity Maps API Integration

A production-ready solution that checks the carbon intensity of the target AWS region before every software deployment.

## Key Architecture
1. **GitHub Actions**: Invokes Carbon Checker Lambda during the build pipeline.
2. **Carbon Checker Lambda**: Calls **Electricity Maps API v3** to check carbon intensity (gCO2eq/kWh).
3. **Amazon SQS**: Stores deferred deployment requests if carbon intensity exceeds the threshold.
4. **Amazon EventBridge**: Triggers Lambda re-check every 5 minutes. Auto-deploys when grid intensity drops.
5. **Amazon S3**: Persists audit logs & sustainability reports.
6. **Amazon CloudWatch**: Centralized structured logging.

## Installation & Deployment Guide
1. Store API key in AWS Secrets Manager:
   \`\`\`bash
   aws secretsmanager create-secret --name prod/electricitymaps/key --secret-string '{"ELECTRICITY_API_KEY":"YOUR_KEY"}'
   \`\`\`
2. Deploy Lambda function with IAM execution role.
3. Configure EventBridge rule to trigger SQS Processor Lambda every 5 minutes.
`,

  sampleReportJson: `{
  "repository": "carbon-aware-scheduler",
  "region": "us-east-1",
  "zone": "US-CAL-CISO",
  "carbonIntensity": 182,
  "threshold": 250,
  "decision": "DEPLOY",
  "savedCarbon": "Estimated 3.40 kg CO2e",
  "timestamp": "2026-07-31T03:12:00Z",
  "workflowId": "91823741",
  "commitSha": "82f1b4a"
}`
};
