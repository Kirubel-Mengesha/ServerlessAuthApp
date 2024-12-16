import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import "../styles/SignUp.css";
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    profileImage: null,
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profileImage: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Request a pre-signed URL from the backend
      const presignedUrlResponse = await axios.post(
        "https://dctzy306k8.execute-api.us-east-1.amazonaws.com/dev/get-presigned-url",
        {
          fileType: formData.profileImage.type,
        }
      );

      const { uploadUrl, fileUrl } = presignedUrlResponse.data;

      // Step 2: Upload the profile image directly to S3
      await axios.put(uploadUrl, formData.profileImage, {
        headers: {
          "Content-Type": formData.profileImage.type,
        },
      });

      // Step 3: Submit the form data to the backend along with the file URL
      const signupData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        profileImageUrl: fileUrl,
      };

      await axios.post(
        "https://dctzy306k8.execute-api.us-east-1.amazonaws.com/dev/signup",
        signupData
      );

      setSuccessMessage("Sign-up successful!"); // Set the success message
      setFormData({ email: "", password: "", name: "", profileImage: null }); // Clear form data
      navigate("/login");
    } catch (error) {
      console.error(error);
      setError(
        error.response
          ? error.response.data.message
          : "An error occurred. Please try again."
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          padding: '40px',
          //backgroundColor: 'rgba(255, 255, 255, 0.9)',
          background: 'linear-gradient(to right, #e0f7fa, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          marginTop: '50px',
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit}>
          {error && <Typography color="error">{error}</Typography>}
          <TextField
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          <TextField
            label="Name"
            name="name"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          <TextField
            type="file"
            inputProps={{ accept: 'image/*' }}
            fullWidth
            margin="normal"
            onChange={handleFileChange}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: '20px' }}
          >
            Sign Up
          </Button>
        </form>
        {successMessage && <Typography color="success.main">{successMessage}</Typography>}
      </Box>
    </Container>
  );
};

export default SignUp;
