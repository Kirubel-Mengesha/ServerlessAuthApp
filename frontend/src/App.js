import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { AppBar, Toolbar, Button, Box } from "@mui/material";

const App = () => {
  // Cloud circle style
  const cloudStyle = {
    backgroundColor: "#fff",
    background: "radial-gradient(circle, #fff, #e0f7fa)", // Cloud-like gradient
    borderRadius: "50%",
    position: "absolute",
    opacity: 0.8, // Slight transparency for clouds
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
  };

  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #a3d5f7 0%, #e0f7fa 30%, #ffffff 100%)",
        minHeight: "100vh",
        padding: "0",
        margin: "0",
        display: "flex",
        flexDirection: "column",
        position: "relative", // Position relative for cloud circles
        overflow: "hidden", // Prevent overflow from the cloud circles
      }}
    >
      {/* Cloud-like circles */}
      <div style={{ ...cloudStyle, width: "150px", height: "80px", top: "50px", left: "30px" }}></div>
      <div style={{ ...cloudStyle, width: "200px", height: "100px", top: "150px", left: "250px" }}></div>
      <div style={{ ...cloudStyle, width: "180px", height: "90px", top: "300px", left: "450px" }}></div>
      <div style={{ ...cloudStyle, width: "120px", height: "60px", top: "400px", left: "150px" }}></div>
      <div style={{ ...cloudStyle, width: "120px", height: "60px", top: "400px", right: "150px" }}></div>
      <div style={{ ...cloudStyle, width: "120px", height: "60px", top: "400px", right: "450px" }}></div>
      <div style={{ ...cloudStyle, width: "150px", height: "80px", top: "50px", right: "30px" }}></div>
      <div style={{ ...cloudStyle, width: "200px", height: "100px", top: "150px", right: "250px" }}></div>
      <div style={{ ...cloudStyle, width: "200px", height: "100px", bottom: "150px", left: "250px" }}></div>
      <div style={{ ...cloudStyle, width: "200px", height: "100px", bottom: "150px", right: "250px" }}></div>

      <Router>
        <AppBar position="static" sx={{ backgroundColor: "#0288d1" }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Button color="inherit" component={Link} to="/">
                Sign Up
              </Button>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/profile">
                Profile
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
