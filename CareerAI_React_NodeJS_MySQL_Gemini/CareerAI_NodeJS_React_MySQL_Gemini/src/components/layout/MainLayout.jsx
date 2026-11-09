import {NavLink,Outlet,useNavigate} from "react-router-dom";
import {BriefcaseBusiness,FileText,LayoutDashboard,Sparkles,UserRound,MessageCircle,LogOut,ShieldCheck} from "lucide-react";
const menuItems=[
 {path:"/dashboard",label:"Tổng quan",icon:LayoutDashboard},
 {path:"/profile",label:"Hồ sơ cá nhân",icon:UserRound},
 {path:"/my-cvs",label:"Quản lý CV",icon:FileText},
 {path:"/cv-analysis",label:"Phân tích CV",icon:Sparkles},
 {path:"/ai-chat",label:"Trò chuyện với AI",icon:MessageCircle},
 {path:"/jobs",label:"Tìm việc làm",icon:BriefcaseBusiness}
];
function MainLayout(){
 const navigate=useNavigate();const user=JSON.parse(localStorage.getItem("careerai_user")||"null");
 function logout(){localStorage.removeItem("careerai_token");localStorage.removeItem("careerai_user");navigate("/login");}
 return <div className="app-layout"><aside className="sidebar"><div className="brand"><span className="brand-logo">C</span><span>CareerAI</span></div>
 <p className="menu-title">MENU CHÍNH</p><nav className="sidebar-menu">{menuItems.map(item=>{const Icon=item.icon;return <NavLink key={item.path} to={item.path} className={({isActive})=>isActive?"menu-link active":"menu-link"}><Icon size={18}/><span>{item.label}</span></NavLink>;})}
 {user?.role==="ADMIN"&&<NavLink to="/admin" className={({isActive})=>isActive?"menu-link active":"menu-link"}><ShieldCheck size={18}/><span>Quản trị hệ thống</span></NavLink>}</nav>
 <button className="logout-btn" onClick={logout}><LogOut size={17}/> Đăng xuất</button></aside>
 <main className="main-content"><header className="topbar"><span>{user?.role==="ADMIN"?"Khu vực quản trị":"Khu vực ứng viên"}</span><span className="user-label">{user?.name||"CareerAI"} · {user?.role==="ADMIN"?"Admin":"Candidate"}</span></header><section className="page-content"><Outlet/></section></main></div>;
}
export default MainLayout;
