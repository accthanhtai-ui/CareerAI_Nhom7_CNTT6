import { useNavigate } from "react-router-dom";
import { User, LogOut, Bell, Shield, Sparkles } from "lucide-react";

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("careerai_user") || "null");

  function handleLogout() {
    localStorage.removeItem("careerai_token");
    localStorage.removeItem("careerai_user");
    navigate("/login");
  }

  const roleText = user?.role === "ADMIN" ? "Quản trị viên" : "Ứng viên";
  const initial = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-badge">
          {user?.role === "ADMIN" ? <Shield size={14} /> : <Sparkles size={14} />}
          {user?.role === "ADMIN" ? "Khu vực Quản trị" : "Khu vực Ứng viên"}
        </span>
      </div>

      <div className="topbar-right">
        <div className="user-profile-badge">
          <div className="user-avatar">{initial}</div>
          <div className="user-info-text">
            <span className="user-name">{user?.name || "Người dùng"}</span>
            <span className="user-role-tag">{roleText}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="topbar-logout-btn" 
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

export default Header;
