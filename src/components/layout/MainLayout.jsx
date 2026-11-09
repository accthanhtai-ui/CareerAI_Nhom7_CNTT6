import { NavLink, Outlet } from "react-router-dom";
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Sparkles,
  UserRound,
} from "lucide-react";

const menuItems = [
  { path: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { path: "/profile", label: "Hồ sơ cá nhân", icon: UserRound },
  { path: "/my-cvs", label: "Quản lý CV", icon: FileText },
  { path: "/cv-analysis", label: "Phân tích CV", icon: Sparkles },
  { path: "/jobs", label: "Tìm việc làm", icon: BriefcaseBusiness },
];

function MainLayout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo">C</span>
          <span>CareerAI</span>
        </div>

        <p className="menu-title">MENU CHÍNH</p>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>Khu vực ứng viên</span>
          <span className="user-label">CareerAI</span>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default MainLayout;
