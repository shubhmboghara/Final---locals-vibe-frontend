import { Routes, Route, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Service from "./pages/Service/Service";
import Setting from "./pages/Setting/Setting";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Logout from "./components/Logout/Logout";
import Otp from "./components/Otp/Otp";
import Neighborhood from "./components/Neighborhood/Neighborhood";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import ForgetPassword from "./components/ForgetPassword/ForgetPassword";
import Search from "./pages/Search/Search";
import ProfileView from "./components/ProfileView/ProfileView";
import Post from "./pages/Post/Post";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { useEffect } from "react";

function App() {
  const theme = useSelector((state) => state.theme.mode);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  
  const publicRoutes = ["/login", "/register", "/Otp", "/forget-password", "/reset-password"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen h-screen w-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
      {!isPublicRoute && <Navbar />}
      <div className={`flex flex-col w-full min-h-screen ${!isPublicRoute ? "lg:ml-72" : ""} bg-white dark:bg-neutral-900`}>
        <main className={`flex-1 ${!isPublicRoute ? "pt-16 lg:pt-0" : ""} bg-white dark:bg-neutral-900`}>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/Otp" element={<Otp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forget-password" element={<ForgetPassword />} />

            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/neighborhood" element={<ProtectedRoute><Neighborhood /></ProtectedRoute>} />
            <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/post" element={<ProtectedRoute><Post /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Service /></ProtectedRoute>} />
            <Route path="/setting" element={<ProtectedRoute><Setting /></ProtectedRoute>} />
            <Route path="/Profile-View/:id" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
