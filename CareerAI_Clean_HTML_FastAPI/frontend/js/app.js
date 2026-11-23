import { getToken, getUser } from "./common/api.js";
import { showMessage } from "./common/ui.js";

const page = document.body.dataset.page;
const publicPages = ["login", "register", "index"];

// Kiểm tra phiên đăng nhập cho các trang yêu cầu xác thực
if (!publicPages.includes(page) && !getToken()) {
    location.href = "/pages/login.html";
}

// Kiểm tra phân quyền truy cập trang Quản trị
const user = getUser();
if (page === "admin" && user?.role !== "ADMIN") {
    location.href = "/pages/dashboard.html";
}

// Hiển thị thông tin người dùng đang đăng nhập trên Topbar
const userLabel = document.querySelector("#currentUser");
if (userLabel && user) {
    userLabel.innerHTML = `👤 <strong>${user.name || user.email}</strong> ${user.role === 'ADMIN' ? '<span class="tag" style="background:#fee2e2;color:#991b1b;font-size:10px">Admin</span>' : ''}`;
}

// Ẩn menu Quản trị đối với tài khoản không phải Admin
if (user?.role !== "ADMIN") {
    document.querySelectorAll(".admin-link").forEach(el => {
        el.style.display = "none";
    });
}

// Làm nổi bật menu đang hoạt động (Active Navigation State)
if (page) {
    document.querySelectorAll(".sidebar nav a").forEach(link => {
        const href = link.getAttribute("href") || "";
        if (href.includes(`${page}.html`) || (page === "index" && href === "/")) {
            link.classList.add("active");
        }
    });
}

// Xử lý nút Đăng xuất an toàn trên toàn hệ thống
document.querySelector("#logoutButton")?.addEventListener("click", () => {
    localStorage.removeItem("careerai_token");
    localStorage.removeItem("careerai_user");
    location.href = "/pages/login.html";
});

// Hiển thị thông báo khi phiên hết hạn ở trang login
if (page === "login" && new URLSearchParams(location.search).get("expired") === "1") {
    showMessage("Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.", "info");
}

// Bản đồ tải động các trang giao diện (Routing)
const pages = {
    login: "./pages/login.js",
    register: "./pages/register.js",
    dashboard: "./pages/dashboard.js",
    profile: "./pages/profile.js",
    "my-cvs": "./pages/my-cvs.js",
    "cv-analysis": "./pages/cv-analysis.js",
    "ai-chat": "./pages/ai-chat.js",
    jobs: "./pages/jobs.js",
    "job-detail": "./pages/job-detail.js",
    company: "./pages/company.js",
    "saved-jobs": "./pages/saved-jobs.js",
    applications: "./pages/applications.js",
    notifications: "./pages/notifications.js",
    admin: "./pages/admin.js"
};

// Tải trang với cơ chế chống lưu cache cũ (Cache-Busting Timestamp)
if (pages[page]) {
    const scriptUrl = `${pages[page]}?t=${Date.now()}`;
    import(scriptUrl).catch(error => {
        console.error(`Lỗi tải trang [${page}]:`, error);
        showMessage(`Không thể khởi chạy trang: ${error.message || "Lỗi giao diện"}`, "error");
    });
}
