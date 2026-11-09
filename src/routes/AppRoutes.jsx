import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/candidate/Dashboard";
import Profile from "../pages/candidate/Profile";
import MyCV from "../pages/candidate/MyCV";
import CVAnalysis from "../pages/candidate/CVAnalysis";
import JobList from "../pages/jobs/JobList";
import JobDetail from "../pages/jobs/JobDetail";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-cvs" element={<MyCV />} />
        <Route path="/cv-analysis" element={<CVAnalysis />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
