import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import "../styles/Login.css";
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://dctzy306k8.execute-api.us-east-1.amazonaws.com/dev/login",
        formData
      );
      console.log(response.data);
      localStorage.setItem("token", response.data.token);
      navigate("/profile");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          background: 'linear-gradient(to right, #e0f7fa, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          marginTop: '50px',
          padding: '40px',
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: '20px', backgroundColor: '#0288d1' }}
          >
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
