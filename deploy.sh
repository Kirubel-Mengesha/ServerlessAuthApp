#!/bin/bash

# Variables
LAMBDA_FUNCTION_NAME="LambdaFunction"
LAMBDA_ROLE_NAME="LambdaExecutionRole"
LAMBDA_ZIP_FILE="C:/Users/kirub/Music/cloud_final_project/zipped-final-cc/backend-b.zip"
FRONTEND_ZIP_FILE="C:/Users/kirub/Music/cloud_final_project/zipped-final-cc/frontend.zip"
LAMBDA_RUNTIME="nodejs20.x"
LAMBDA_HANDLER="index.handler"
REGION="us-east-1"
CODE_BUCKET="cc-backend-bucket-today"
FRONTEND_BUCKET="cc-frontend-bucket-today"
CLOUDFORMATION_TEMPLATE="F:/cloud computing/project/cloudformation/deploy.yaml"

# Step 1: Package Lambda Function Code
echo "Packaging Lambda function code..."
powershell.exe Compress-Archive -Path "C:/Users/kirub/Music/cloud_final_project/backend-b/*" -DestinationPath $LAMBDA_ZIP_FILE -Force

if [ $? -ne 0 ]; then
    echo "Error: Lambda zip packaging failed!"
    exit 1
fi

# Step 2: Package Frontend Code
echo "Packaging frontend code..."
powershell.exe Compress-Archive -Path "C:/Users/kirub/Music/cloud_final_project/frontend/*" -DestinationPath $FRONTEND_ZIP_FILE -Force

if [ $? -ne 0 ]; then
    echo "Error: Frontend zip packaging failed!"
    exit 1
fi

# Step 3: Ensure the S3 Buckets Exist

# Check if Lambda bucket exists, if not, create it
echo "Checking if backend S3 bucket exists..."
aws s3api head-bucket --bucket $CODE_BUCKET 2>/dev/null

if [ $? -ne 0 ]; then
    echo "Creating S3 bucket: $CODE_BUCKET"
    aws s3api create-bucket --bucket $CODE_BUCKET --region $REGION --create-bucket-configuration LocationConstraint=$REGION
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create backend S3 bucket!"
        exit 1
    fi
fi

# Check if Frontend bucket exists, if not, create it
echo "Checking if frontend S3 bucket exists..."
aws s3api head-bucket --bucket $FRONTEND_BUCKET 2>/dev/null

if [ $? -ne 0 ]; then
    echo "Creating S3 bucket: $FRONTEND_BUCKET"
    aws s3api create-bucket --bucket $FRONTEND_BUCKET --region $REGION --create-bucket-configuration LocationConstraint=$REGION
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create frontend S3 bucket!"
        exit 1
    fi
fi

# Step 4: Upload Code to S3
echo "Uploading Lambda zip file to S3..."
aws s3 cp $LAMBDA_ZIP_FILE s3://$CODE_BUCKET/

if [ $? -ne 0 ]; then
    echo "Error: Upload to S3 failed for Lambda!"
    exit 1
fi

echo "Uploading Frontend zip file to S3..."
aws s3 cp $FRONTEND_ZIP_FILE s3://$FRONTEND_BUCKET/

if [ $? -ne 0 ]; then
    echo "Error: Upload to S3 failed for Frontend!"
    exit 1
fi

# Step 5: Create IAM Role for Lambda (if not already created)
ROLE_ARN=$(aws iam get-role --role-name $LAMBDA_ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "Creating IAM Role for Lambda..."
    aws iam create-role \
      --role-name $LAMBDA_ROLE_NAME \
      --assume-role-policy-document file://<(cat << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
      )
    
    if [ $? -ne 0 ]; then
        echo "Error: IAM role creation failed!"
        exit 1
    fi

    ROLE_ARN=$(aws iam get-role --role-name $LAMBDA_ROLE_NAME --query 'Role.Arn' --output text)

    # Attach necessary policies
    echo "Attaching policies to the IAM role..."
    aws iam attach-role-policy --role-name $LAMBDA_ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
    aws iam attach-role-policy --role-name $LAMBDA_ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
    aws iam attach-role-policy --role-name $LAMBDA_ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonAPIGatewayInvokeFullAccess
    aws iam attach-role-policy --role-name $LAMBDA_ROLE_NAME --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
fi

# Step 6: Deploy CloudFormation Stack
echo "Deploying CloudFormation stack..."
aws cloudformation create-stack --stack-name MyAuthAppStack --template-body file://$CLOUDFORMATION_TEMPLATE --capabilities CAPABILITY_NAMED_IAM

if [ $? -ne 0 ]; then
    echo "Error: CloudFormation deployment failed!"
    exit 1
fi

echo "Deployment initiated. You can monitor the progress in the AWS CloudFormation console."
