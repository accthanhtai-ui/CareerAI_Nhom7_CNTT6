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
    toggleInput.checked = theme === "dark";
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
                    <input class="input" id="dn" type="checkbox" style="position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;" />
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
    toggleInput.checked = getStoredTheme() === "dark";
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
  userLabel.innerHTML = `👤 <strong>${user.name || user.email}</strong> ${user.role === "ADMIN" ? '<span class="tag" style="background:#fee2e2;color:#991b1b;font-size:10px">Admin</span>' : ""}`;
}

// Phân quyền bảo mật: Chỉ hiển thị menu Quản trị khi người dùng có role ADMIN
if (user?.role === "ADMIN") {
  document.body.classList.add("is-admin");
  document.querySelectorAll(".admin-link").forEach((el) => {
    el.style.display = "flex";
  });
} else {
  document.body.classList.remove("is-admin");
  document.querySelectorAll(".admin-link").forEach((el) => {
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
  const isCollapsed =
    localStorage.getItem("careerai_sidebar_collapsed") === "1";
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

  // Hiệu ứng chuyển trang kiểu PowerPoint (Sidebar & Header đứng yên, chỉ Main Content chuyển mượt)
  const resetExitStyles = () => {
    const content =
      document.querySelector(".page-content") ||
      document.querySelector(".main-area > div:not(.topbar)");
    if (!content) return;
    content.style.transition = "";
    content.style.opacity = "";
    content.style.transform = "";
    content.style.filter = "";
  };

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) resetExitStyles();
  });

  sidebar
    .querySelectorAll(".sidebar-link, .sidebar-sublink")
    .forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (
          href &&
          !href.startsWith("#") &&
          !link.classList.contains("active") &&
          !link.classList.contains("sidebar-menu-toggle") &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          const content =
            document.querySelector(".page-content") ||
            document.querySelector(".main-area > div:not(.topbar)");
          if (content) {
            e.preventDefault();
            content.style.transition =
              "opacity 0.16s cubic-bezier(0.22, 1, 0.36, 1), transform 0.16s cubic-bezier(0.22, 1, 0.36, 1)";
            content.style.opacity = "0";
            content.style.transform = "translateY(8px)";

            setTimeout(() => {
              window.location.href = href;
            }, 150);
          }
        }
      });
    });

  // Phím tắt bàn phím: Ctrl + K / ⌘K (Focus nhanh vào ô tìm kiếm)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      const searchInput =
        document.querySelector(".sidebar-search-input") ||
        document.querySelector("#searchInput") ||
        document.querySelector("input[type='search']") ||
        document.querySelector(".search-box input");
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
        if (searchInput.select) searchInput.select();
      }
    }
  });

  // Tự động kích hoạt hiệu ứng thanh tiến trình (Progress Bar Animation)
  setTimeout(() => {
    document
      .querySelectorAll(
        ".progress-bar-fill, .cv-progress-fill, div[role='progressbar'] > div",
      )
      .forEach((bar) => {
        const targetWidth = bar.getAttribute("data-width") || bar.style.width;
        if (targetWidth && targetWidth !== "0%") {
          bar.style.width = "0%";
          requestAnimationFrame(() => {
            setTimeout(() => {
              bar.style.width = targetWidth;
            }, 60);
          });
        }
      });
  }, 380);
}

// ========================================================
// 2.2. Hiệu ứng Logo sau khi đăng nhập thành công (1 lần duy nhất)
// ========================================================
function runPostLoginSplash() {
  const isLandingPage = page === "dashboard" || page === "admin";
  const hasFlag = sessionStorage.getItem("cv_just_logged_in") === "true";

  // Luôn xóa cờ ngay khi kiểm tra để tuyệt đối không chạy lại khi F5 hay chuyển mục
  if (hasFlag) {
    sessionStorage.removeItem("cv_just_logged_in");
  }

  if (!hasFlag || !isLandingPage || publicPages.includes(page) || !getToken()) {
    document.documentElement.classList.remove("cv-splash-pending");
    return;
  }

  const sidebar = document.querySelector(".sidebar");
  const realLogo = document.querySelector(".sidebar-brand-logo");
  const mobileToggle = document.querySelector("#sidebarMobileToggle");
  if (!sidebar || !realLogo) {
    document.documentElement.classList.remove("cv-splash-pending");
    return;
  }

  const isMobile = window.innerWidth <= 850;
  const sidebarRect = sidebar.getBoundingClientRect();
  const logoRect = realLogo.getBoundingClientRect();
  const mobileBtnRect = mobileToggle
    ? mobileToggle.getBoundingClientRect()
    : null;

  // Tọa độ đích tại góc trên bên trái (khớp vị trí Logo Sidebar trên Desktop, hoặc đầu Topbar trên Mobile)
  const targetRect =
    !isMobile && logoRect.width > 0
      ? {
          left: logoRect.left,
          top: logoRect.top,
          width: logoRect.width,
          height: logoRect.height,
        }
      : {
          left: mobileBtnRect ? mobileBtnRect.right + 12 : 60,
          top: 16,
          width: 28,
          height: 28,
        };

  const logoSize = 92;
  const startLeft = Math.round((window.innerWidth - logoSize) / 2);
  const startTop = Math.round((window.innerHeight - logoSize) / 2 - 16);

  // Gắn thứ tự hiển thị nhẹ cho từng mục menu bên dưới Logo ở Giai đoạn 3
  const navItems = Array.from(
    sidebar.querySelectorAll(".sidebar-nav .sidebar-link, .sidebar-footer"),
  );
  navItems.forEach((el, idx) => {
    el.style.setProperty("--cv-nav-i", String(Math.min(idx, 10)));
  });

  // Tạo lớp phủ Splash (Cô lập class .cv-splash-*)
  const splashRoot = document.createElement("div");
  splashRoot.className = "cv-splash-root";
  splashRoot.setAttribute("aria-hidden", "true");
  splashRoot.innerHTML = `
        <div class="cv-splash-backdrop ${isMobile ? "cv-splash-backdrop-mobile" : ""}"></div>
        <div class="cv-splash-logo-float" style="left:${startLeft}px;top:${startTop}px;">
            <div class="cv-splash-logo-inner">
                <img src="/assets/logo.png" alt="CareerAI" />
            </div>
        </div>
        <div class="cv-splash-subtitle" style="top:${startTop + logoSize + 18}px;">
            Đang mở không gian làm việc...
        </div>
    `;

  document.body.classList.add("cv-splash-hold");
  document.body.appendChild(splashRoot);

  const splashBackdrop = splashRoot.querySelector(".cv-splash-backdrop");
  const splashLogoFloat = splashRoot.querySelector(".cv-splash-logo-float");

  // Gỡ trạng thái ẩn ban đầu ngay sau khi lớp phủ Splash đã gắn lên DOM (chống nháy khung)
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("cv-splash-pending");
  });

  // Giai đoạn 2 (0.48s – 1.12s): Chữ phụ mờ dần, Logo lướt về đúng Logo Sidebar, nền biến hình thành Sidebar
  setTimeout(() => {
    const dx = targetRect.left - startLeft;
    const dy = targetRect.top - startTop;
    const targetScale = (targetRect.width || 28) / logoSize;

    splashRoot.classList.add("cv-splash-stage2");
    if (!isMobile && splashBackdrop) {
      splashBackdrop.style.width = `${sidebarRect.width || 260}px`;
    }
    if (splashLogoFloat) {
      splashLogoFloat.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${targetScale})`;
    }
  }, 480);

  // Giai đoạn 3 (0.86s – 1.54s): Bung mở nội dung chính từ góc trên trái, hiện menu & chạy nhịp Dashboard
  setTimeout(() => {
    document.body.classList.remove("cv-splash-hold");
    document.body.classList.add("cv-splash-reveal");
  }, 860);

  // Hòa liền mạch vào Logo & Sidebar thật rồi gỡ Splash khỏi DOM (~1.54s tổng thời gian)
  setTimeout(() => {
    splashRoot.classList.add("cv-splash-fadeout");
  }, 1180);

  const cleanupSplash = () => {
    if (splashRoot.parentNode) splashRoot.remove();
    document.documentElement.classList.remove("cv-splash-pending");
    document.body.classList.remove("cv-splash-hold", "cv-splash-reveal");
    navItems.forEach((el) => el.style.removeProperty("--cv-nav-i"));
  };

  setTimeout(cleanupSplash, 1560);
}

// Khởi chạy Sidebar tương tác & hiệu ứng Splash (nếu vừa đăng nhập xong)
const bootLayoutUI = () => {
  initSidebar();
  runPostLoginSplash();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootLayoutUI);
} else {
  bootLayoutUI();
}

// Làm nổi bật menu đang hoạt động (Active Navigation State)
if (page) {
  document
    .querySelectorAll(".sidebar nav a, .sidebar-link, .sidebar-sublink")
    .forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (
        href.includes(`${page}.html`) ||
        (page === "index" && (href === "/" || href === "/index.html"))
      ) {
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
  sessionStorage.removeItem("cv_just_logged_in");
  location.href = "/pages/login.html";
});

// Hiển thị thông báo khi phiên hết hạn ở trang login
if (
  page === "login" &&
  new URLSearchParams(location.search).get("expired") === "1"
) {
  showMessage(
    "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.",
    "info",
  );
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
  admin: "./pages/admin.js",
};

if (pages[page]) {
  const scriptUrl = `${pages[page]}?t=${Date.now()}`;
  import(scriptUrl).catch((error) => {
    console.error(`Lỗi tải trang [${page}]:`, error);
    showMessage(
      `Không thể khởi chạy trang: ${error.message || "Lỗi giao diện"}`,
      "error",
    );
  });
}
