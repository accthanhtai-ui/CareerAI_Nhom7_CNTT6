import { getToken, getUser } from "./common/api.js";
import { showMessage } from "./common/ui.js";

// ========================================================
// 1. Quản lý Chế độ Giao diện Sáng / Tối (Day / Night Theme)
// ========================================================
const THEME_KEY = "careerai_theme";

export function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
}

export function applyTheme(theme) {
    if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        document.body?.classList.add("dark-theme");
    } else {
        document.documentElement.removeAttribute("data-theme");
        document.body?.classList.remove("dark-theme");
    }
    const toggleInput = document.querySelector("#dn");
    if (toggleInput) {
        toggleInput.checked = (theme === "dark");
    }
}

// Khởi tạo theme ngay lập tức
applyTheme(getStoredTheme());

// CHỈ chèn nút Day / Night Toggle Switch khi người dùng đã vào hệ thống (ở thanh Topbar)
function initThemeToggle() {
    let toggleInput = document.querySelector("#dn");
    if (!toggleInput) {
        const topbar = document.querySelector(".topbar");
        
        // CHỈ hiển thị trong Topbar sau khi đăng nhập (không hiển thị ở màn hình Login/Register)
        if (topbar) {
            const toggleHtml = `
                <div class="toggleWrapper" title="Chuyển đổi giao diện Sáng (AM) / Tối (PM)">
                    <input class="input" id="dn" type="checkbox" />
                    <label class="toggle" for="dn">
                        <span class="toggle__handler">
                            <span class="crater crater--1"></span>
                            <span class="crater crater--2"></span>
                            <span class="crater crater--3"></span>
                        </span>
                        <span class="star star--1"></span>
                        <span class="star star--2"></span>
                        <span class="star star--3"></span>
                        <span class="star star--4"></span>
                        <span class="star star--5"></span>
                        <span class="star star--6"></span>
                    </label>
                </div>
            `;

            const userChip = topbar.querySelector("#currentUser");
            const rightWrap = document.createElement("div");
            rightWrap.className = "topbar-theme-wrap";
            
            if (userChip) {
                topbar.insertBefore(rightWrap, userChip);
                rightWrap.innerHTML = toggleHtml;
                rightWrap.appendChild(userChip);
            } else {
                rightWrap.innerHTML = toggleHtml;
                topbar.appendChild(rightWrap);
            }
            toggleInput = document.querySelector("#dn");
        }
    }

    if (toggleInput) {
        toggleInput.checked = (getStoredTheme() === "dark");
        toggleInput.addEventListener("change", (e) => {
            const newTheme = e.target.checked ? "dark" : "light";
            localStorage.setItem(THEME_KEY, newTheme);
            applyTheme(newTheme);
        });
    }
}

// Khởi chạy toggle theme khi DOM đã sẵn sàng
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
} else {
    initThemeToggle();
}

// ========================================================
// 2. Kiểm tra quyền & Phiên làm việc
// ========================================================
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

// Phân quyền bảo mật: Chỉ hiển thị menu Quản trị khi người dùng có role ADMIN
if (user?.role === "ADMIN") {
    document.body.classList.add("is-admin");
    document.querySelectorAll(".admin-link").forEach(el => {
        el.style.display = "flex";
    });
} else {
    document.body.classList.remove("is-admin");
    document.querySelectorAll(".admin-link").forEach(el => {
        el.style.display = "none";
    });
}

// ========================================================
// 2.1. Quản lý Sidebar Dark Mode SaaS (Thu gọn & Mobile Drawer)
// ========================================================
function initSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    const toggleBtn = document.querySelector("#sidebarToggle");
    const mobileToggleBtn = document.querySelector("#sidebarMobileToggle");
    const backdrop = document.querySelector("#sidebarBackdrop");

    // Khôi phục trạng thái thu gọn đã lưu từ localStorage
    const isCollapsed = localStorage.getItem("careerai_sidebar_collapsed") === "1";
    if (isCollapsed && window.innerWidth > 850) {
        sidebar.classList.add("collapsed");
    }

    // Toggle thu gọn / mở rộng Sidebar
    const toggleSidebar = () => {
        const collapsed = sidebar.classList.toggle("collapsed");
        localStorage.setItem("careerai_sidebar_collapsed", collapsed ? "1" : "0");
    };

    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleSidebar);
    }

    // Phím tắt bàn phím: Ctrl + B (Thu gọn / Mở rộng menu)
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
            const activeTag = document.activeElement?.tagName?.toLowerCase();
            if (activeTag !== "input" && activeTag !== "textarea") {
                e.preventDefault();
                toggleSidebar();
            }
        }
    });

    // Xử lý Mobile Drawer (Trượt ngang trên điện thoại)
    const openMobileSidebar = () => {
        sidebar.classList.add("mobile-open");
        if (backdrop) backdrop.classList.add("active");
    };

    const closeMobileSidebar = () => {
        sidebar.classList.remove("mobile-open");
        if (backdrop) backdrop.classList.remove("active");
    };

    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener("click", () => {
            if (sidebar.classList.contains("mobile-open")) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        });
    }

    if (backdrop) {
        backdrop.addEventListener("click", closeMobileSidebar);
    }

    // Đóng drawer khi nhấn phím Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebar.classList.contains("mobile-open")) {
            closeMobileSidebar();
        }
    });
}

// Khởi chạy Sidebar tương tác
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSidebar);
} else {
    initSidebar();
}

// Làm nổi bật menu đang hoạt động (Active Navigation State)
if (page) {
    document.querySelectorAll(".sidebar nav a, .sidebar-link, .sidebar-sublink").forEach(link => {
        const href = link.getAttribute("href") || "";
        if (href.includes(`${page}.html`) || (page === "index" && (href === "/" || href === "/index.html"))) {
            link.classList.add("active");
            // Tự động mở submenu nếu mục con đang được chọn
            const parentSubmenu = link.closest(".has-submenu");
            if (parentSubmenu) {
                parentSubmenu.classList.add("submenu-open");
            }
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

// ========================================================
// 3. Định tuyến tải trang (Routing) & Cache-Busting
// ========================================================
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

if (pages[page]) {
    const scriptUrl = `${pages[page]}?t=${Date.now()}`;
    import(scriptUrl).catch(error => {
        console.error(`Lỗi tải trang [${page}]:`, error);
        showMessage(`Không thể khởi chạy trang: ${error.message || "Lỗi giao diện"}`, "error");
    });
}
