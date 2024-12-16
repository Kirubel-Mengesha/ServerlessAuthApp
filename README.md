# Auth Application

A serverless authentication application that allows users to sign up, log in, and upload profile images. This application is built with a modern tech stack and includes automated deployment using CI/CD pipelines.

## Features

- **Sign Up**: Users can register by providing their email, password, name, and profile image.
- **Log In**: Users can log in with their registered credentials.
- **Upload Image**: Authenticated users can upload or update their profile images.

## Tech Stack

### Frontend
- Framework: [ReactJS](https://reactjs.org/) (or Angular, or any preferred framework)
- Deployment: AWS S3 and CloudFront

### Backend
- Technology: [Node.js](https://nodejs.org/), Python, or Java
- Deployment: AWS Lambda and API Gateway

### Database
- Service: AWS DynamoDB

### Infrastructure as Code
- AWS CloudFormation (YAML templates)

### Continuous Integration/Continuous Deployment (CI/CD)
- CI/CD pipeline implemented for the frontend deployment.

## Architecture

This application follows a **serverless architecture**:

- **Frontend**: Deployed on S3 and distributed via CloudFront.
- **Backend**: Lambda functions accessed through API Gateway.
- **Database**: User data stored in DynamoDB.

## Prerequisites

- AWS CLI installed and configured.
- Node.js and npm installed.
- An AWS account.

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```

4. Deploy resources using CloudFormation:
   ```bash
   aws cloudformation deploy --template-file template.yaml --stack-name AuthAppStack
   ```

5. Configure environment variables for the backend.

6. Deploy the application:
   - Frontend: Use the CI/CD pipeline or manually upload to S3.
   - Backend: Deploy to AWS Lambda.

## Usage

### Sign Up
- Endpoint: `POST /signup`
- Request: 
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword",
    "name": "Your Name"
  }
  ```
- Profile image: Send as `form-data`.

### Log In
- Endpoint: `POST /login`
- Request: 
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```

### Upload Image
- Endpoint: `POST /upload`
- Headers: Include a valid JWT token.
- Profile image: Send as `form-data`.

## CI/CD Pipeline

The CI/CD pipeline is configured to:
- Automatically build and deploy the frontend to S3.
- Provide versioning and rollback support.

## CloudFormation Template

The `deploy.yaml` file defines resources for:
- S3 bucket for frontend.
- CloudFront distribution.
- Lambda functions for backend.
- API Gateway.
- DynamoDB table for user data.

