import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResetPassword from "./components/ResetPassword";
import ChatBox from "./components/ChatBox";
import Login from "./components/Login";
import Register from "./components/Register";
import Forgot from "./components/Forgot";
import { UserProvider } from "./contexts/UserContext";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<ChatBox />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/chatbox" element={<ChatBox />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
        </Routes>
        <ToastContainer />
      </UserProvider>
    </Router>
  );
}

export default App;
