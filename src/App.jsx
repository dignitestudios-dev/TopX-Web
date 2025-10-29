import { Route, Routes } from "react-router";
import "./App.css";
import DashboardLayout from "./layouts/DashboardLayout";
import DummyHome from "./pages/app/DummyHome";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/authentication/Login";
import SignUp from "./pages/onboarding/Signup";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import UpdatePassword from "./pages/authentication/UpdatePassword";
import AccountCreated from "./pages/authentication/AccountCreated";
import Home from "./pages/Others/Home";
import Setting from "./pages/Others/Setting";
import MainRoutes from "./routes/MainRoutes";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="app" element={<DashboardLayout />}>
        <Route path="dashboard" element={<DummyHome />} />
      </Route>

      <Route path="/*" element={<MainRoutes />} />

    
      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="update-password" element={<UpdatePassword />} />
        <Route path="account-created" element={<AccountCreated />} />
      </Route>

      <Route
        path="*"
        element={<div className="text-7xl">Page Not Found</div>}
      />
    </Routes>
  );
}

export default App;
