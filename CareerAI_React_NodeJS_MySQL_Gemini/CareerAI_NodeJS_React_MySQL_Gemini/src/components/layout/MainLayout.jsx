import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

function MainLayout() {
  return (
    <div className="app-layout">
      {/* Sidebar điều hướng cố định bên trái */}
      <Sidebar />

      {/* Khu vực nội dung chính bên phải */}
      <div className="main-content">
        {/* Header trên cùng */}
        <Header />

        {/* Nội dung trang theo từng Route */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* Footer chân trang */}
        <Footer />
      </div>
    </div>
  );
}

export default MainLayout;
