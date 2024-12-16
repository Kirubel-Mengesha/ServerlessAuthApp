import express from "express";
//import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import serverless from "serverless-http";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const upload = multer();

const dynamoDB = new AWS.DynamoDB({
  region: "us-east-1",
});

const s3 = new AWS.S3({
  region: "us-east-1",
});

// Create Users Table if it doesn't exist
const createTable = async () => {
  try {
    const tableNames = await dynamoDB.listTables().promise();
    if (!tableNames.TableNames.includes("Users")) {
      const params = {
        TableName: "Users",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "email", AttributeType: "S" }],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      };
      await dynamoDB.createTable(params).promise();
      console.log("Table 'Users' created successfully");
    } else {
      console.log("Table 'Users' already exists");
    }
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

createTable();

// POST /signup
app.post("/signup", upload.single('profileImageUrl'), async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  const { email, password, name, profileImageUrl } = req.body;
  

  if (!email || !password || !name || !profileImageUrl) {
    return res.status(400).json({
      message: "Email, password, name, and profileImageUrl are required",
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const profileImageUrl = `https://your-s3-bucket-url/${req.file.originalname}`;

    const dynamoParams = {
      TableName: "Users",
      Item: {
        email: { S: email },
        passwordHash: { S: passwordHash },
        name: { S: name },
        profileImageUrl: { S: profileImageUrl },
      },
    };

    await dynamoDB.putItem(dynamoParams).promise();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// POST /get-presigned-url
app.post("/get-presigned-url", upload.none(), async (req, res) => {
  const { fileType } = req.body;

  if (!fileType) {
    return res.status(400).json({ message: "File type is required" });
  }

  try {
    const s3Params = {
      Bucket: "backend-bucket-b",
      Key: `profile-images/${Date.now()}`,
      Expires: 60 * 5,
      ContentType: fileType,
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", s3Params);
    const fileUrl = `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`;

    res.status(200).json({ uploadUrl, fileUrl });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res.status(500).json({ message: "Error generating pre-signed URL" });
  }
});

// POST /login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const params = {
      TableName: "Users",
      Key: {
        email: { S: email },
      },
    };

    const user = await dynamoDB.getItem(params).promise();
    if (!user.Item)
      return res.status(401).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(
      password,
      user.Item.passwordHash.S
    );
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    res.json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// GET /profile
app.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    const email = decoded.email;

    const params = {
      TableName: "Users",
      Key: {
        email: { S: email },
      },
    };

    const user = await dynamoDB.getItem(params).promise();
    if (!user.Item) return res.status(404).json({ message: "User not found" });

    const profile = {
      email: user.Item.email.S,
      name: user.Item.name.S,
      profileImageUrl: user.Item.profileImageUrl.S || "default-avatar.png",
    };

    res.json(profile);
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ message: "Error retrieving profile" });
  }
});

// PATCH /profile
app.patch("/profile", async (req, res) => {
  const { profileImageUrl } = req.body;

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    const email = decoded.email;

    const updateParams = {
      TableName: "Users",
      Key: {
        email: { S: email },
      },
      UpdateExpression: "SET profileImageUrl = :profileImageUrl",
      ExpressionAttributeValues: {
        ":profileImageUrl": { S: profileImageUrl },
      },
      ReturnValues: "ALL_NEW",
    };

    const updatedUser = await dynamoDB.updateItem(updateParams).promise();

    res.status(200).json({
      message: "Profile updated successfully",
      updatedProfile: updatedUser.Attributes,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const port = 3000; // or any other port
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export const handler = serverless(app);
