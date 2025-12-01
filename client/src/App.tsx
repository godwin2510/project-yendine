import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Food from "./pages/Food";
import Community from "./pages/Community";
import Chatbot from "./pages/Chatbot";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLogin from "./pages/GoogleLogin";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem('user-info');
    if (userInfo) {
      setIsAuthenticated(true);
    }
  }, []);

  const PrivateRoute = ({ element }) => {
    const userInfo = localStorage.getItem('user-info');
    return userInfo ? element : <Navigate to="/" />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <GoogleOAuthProvider clientId="303284873713-63bse0ipv47apcr7d4v14bvc2u4naon9.apps.googleusercontent.com">
                  <GoogleLogin />
                </GoogleOAuthProvider>
              } 
            />
            <Route path='/home' element={<PrivateRoute element={<Home />} />} />
            <Route path="/food" element={<PrivateRoute element={<Food />} />} />
            <Route path="/community" element={<PrivateRoute element={<Community />} />} />
            <Route path="/chatbot" element={<PrivateRoute element={<Chatbot />} />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
