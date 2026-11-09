import {Navigate,Route,Routes} from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/candidate/Dashboard";
import Profile from "../pages/candidate/Profile";
import MyCV from "../pages/candidate/MyCV";
import CVAnalysis from "../pages/candidate/CVAnalysis";
import AIChat from "../pages/candidate/AIChat";
import AdminDashboard from "../pages/admin/AdminDashboard";
import JobList from "../pages/jobs/JobList";
import JobDetail from "../pages/jobs/JobDetail";
import NotFound from "../pages/NotFound";
function Protected({children,admin=false}){
 const token=localStorage.getItem("careerai_token");const user=JSON.parse(localStorage.getItem("careerai_user")||"null");
 if(!token)return <Navigate to="/login" replace/>;
 if(admin&&user?.role!=="ADMIN")return <Navigate to="/dashboard" replace/>;
 return children;
}
function AppRoutes(){return <Routes>
 <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
 <Route element={<MainLayout/>}>
  <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
  <Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/>
  <Route path="/profile" element={<Protected><Profile/></Protected>}/>
  <Route path="/my-cvs" element={<Protected><MyCV/></Protected>}/>
  <Route path="/cv-analysis" element={<Protected><CVAnalysis/></Protected>}/>
  <Route path="/ai-chat" element={<Protected><AIChat/></Protected>}/>
  <Route path="/jobs" element={<Protected><JobList/></Protected>}/>
  <Route path="/jobs/:id" element={<Protected><JobDetail/></Protected>}/>
  <Route path="/admin" element={<Protected admin><AdminDashboard/></Protected>}/>
 </Route><Route path="*" element={<NotFound/>}/>
 </Routes>}
export default AppRoutes;
