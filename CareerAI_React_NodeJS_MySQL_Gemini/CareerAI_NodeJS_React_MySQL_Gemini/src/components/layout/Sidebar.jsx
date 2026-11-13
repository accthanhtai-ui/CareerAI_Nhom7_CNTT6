import { NavLink, useNavigate } from "react-router-dom";
import { 
  BriefcaseBusiness, 
  FileText, 
  LayoutDashboard, 
  Sparkles, 
  UserRound, 
  MessageCircle, 
  LogOut, 
  ShieldCheck 
} from "lucide-react";

const menuItems = [
  { path: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { path: "/profile", label: "Hồ sơ cá nhân", icon: UserRound },
  { path: "/my-cvs", label: "Quản lý CV", icon: FileText },
  { path: "/cv-analysis", label: "Phân tích CV", icon: Sparkles },
  { path: "/ai-chat", label: "Trò chuyện với AI", icon: MessageCircle },
  { path: "/jobs", label: "Tìm việc làm", icon: BriefcaseBusiness }
];

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("careerai_user") || "null");

  function handleLogout() {
    localStorage.removeItem("careerai_token");
    localStorage.removeItem("careerai_user");
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      {/* Brand Logo & Name */}
      <div className="brand">
        <img src="/logo-icon.png" alt="CareerAI" className="brand-icon-img" />
        <div className="brand-text-col">
          <span className="brand-name">CareerAI</span>
          <span className="brand-sub">AI-Powered Portfolio</span>
        </div>
      </div>

      <p className="menu-title">MENU CHÍNH</p>

      {/* Navigation Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {user?.role === "ADMIN" && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}
          >
            <ShieldCheck size={18} />
            <span>Quản trị hệ thống</span>
          </NavLink>
        )}
      </nav>

      {/* Logout button */}
      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={17} /> Đăng xuất
      </button>
    </aside>
  );
}

export default Sidebar;
