import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import React from "react";

export default function PrivateRoute() {
  const { currentUser, setCurrentUser } = useUser();
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    if (!currentUser) {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000; // Current time in seconds
                if (decodedToken.exp < currentTime) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    nav('/login');
                } else {
                    setCurrentUser(JSON.parse(user));
                    console.log("User", user);
                }
            } catch (err) {
                console.error("Invalid token", err);
                nav('/login');
            }
            finally {
                setLoading(false);
            }
        } else {
            nav('/login');
        }
    }
    setLoading(false);
}, [currentUser, nav]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "24px",
          fontWeight: "bold",
          color: "#555",
          animation: "fade 1.5s infinite",
        }}
      >
        Loading...
      </div>
    );

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
}
