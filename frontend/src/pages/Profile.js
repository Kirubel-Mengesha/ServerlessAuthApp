import React, { useState, useEffect } from "react";
import axios from "axios";
//import "../styles/Profile.css";
import { Container, Typography, Box, Button, Avatar, TextField } from "@mui/material";

const Profile = () => {
  const [image, setImage] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setError(null); // Clear any previous error when a new file is selected
    setSuccessMessage(null); // Clear previous success message
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Please select an image to upload.");
      return;
    }

    try {
      const presignedUrlResponse = await axios.post(
        "https://dctzy306k8.execute-api.us-east-1.amazonaws.com/dev/get-presigned-url",
        {
          fileType: image.type,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { uploadUrl, fileUrl } = presignedUrlResponse.data;

      await axios.put(uploadUrl, image, {
        headers: {
          "Content-Type": image.type,
        },
      });

      await axios.patch(
        "https://dctzy306k8.execute-api.us-east-1.amazonaws.com/dev/profile",
        { profileImageUrl: fileUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSuccessMessage("Profile picture updated successfully!");
      setError(null); // Clear previous error message
      setImage(null); // Clear the file input
      fetchProfile(); // Reload profile data
    } catch (error) {
      setError("Error uploading profile picture. Please try again.");
      setSuccessMessage(null); // Clear success message on error
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        "https://dctzy306k8.execute-api.us-east-1.amazonaws.com/dev/profile",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProfileData(response.data);
    } catch (error) {
      setError("Error fetching profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          textAlign: 'center',
          padding: '30px',
          //height: '50vh',
          //backgroundColor: 'rgba(255, 255, 255, 0.9)',
          background: 'linear-gradient(to right, #e0f7fa, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          marginTop: '50px',
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Profile
        </Typography>
        <Avatar
          alt="Profile Picture"
          src={profileData.profileImageUrl || "default-avatar.png"}
          sx={{ width: 150, height: 150, margin: '0 auto 20px' }}
        />
        <Typography variant="h6" component="h3">
          {profileData.name}
        </Typography>
        <form onSubmit={handleSubmit}>
          {error && <Typography color="error">{error}</Typography>}
          {successMessage && <Typography color="success.main">{successMessage}</Typography>}
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
            Update Profile Picture
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Profile;
