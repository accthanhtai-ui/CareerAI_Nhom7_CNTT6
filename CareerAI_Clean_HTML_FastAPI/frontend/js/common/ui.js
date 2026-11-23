export function formatErrorMessage(msg) {
    if (!msg) return "Có lỗi xảy ra, vui lòng thử lại.";
    const str = String(msg);
    if (
        str.includes("Failed to fetch") ||
        str.includes("NetworkError") ||
        str.includes("fetch failed") ||
        str.includes("Load failed")
    ) {
        return "Không thể kết nối đến máy chủ backend (FastAPI). Vui lòng kiểm tra lại dịch vụ đang chạy hoặc kết nối mạng.";
    }
    return str;
}

export function showMessage(message, type = "info") {
    const box = document.querySelector("#pageMessage");
    if (!box) return;
    box.textContent = formatErrorMessage(message);
    box.hidden = false;
    box.className = "message";
    if (type === "error") {
        box.style.background = "#fef2f2";
        box.style.border = "1px solid #fecaca";
        box.style.color = "#991b1b";
    } else if (type === "success") {
        box.style.background = "#ecfdf5";
        box.style.border = "1px solid #a7f3d0";
        box.style.color = "#065f46";
    } else {
        box.style.background = "#fff2e8";
        box.style.border = "1px solid #fed7aa";
        box.style.color = "#9a4c0a";
    }
}

export function toast(message, type = "info") {
    const box = document.querySelector("#toast");
    if (!box) return;
    box.textContent = formatErrorMessage(message);
    box.className = "toast show";
    if (type === "success") box.classList.add("toast-success");
    else if (type === "error") box.classList.add("toast-error");
    else if (type === "warning") box.classList.add("toast-warning");
    
    if (box._toastTimer) clearTimeout(box._toastTimer);
    box._toastTimer = setTimeout(() => {
        box.classList.remove("show");
    }, 2800);
}

export function showLoading(container, text = "Đang tải dữ liệu...") {
    if (!container) return;
    container.innerHTML = `
        <div class="loading-state" style="padding:48px 20px;text-align:center;color:var(--muted)">
            <div class="spinner" style="margin-bottom:12px"></div>
            <p style="margin:0;font-size:14px;font-weight:500">${escapeHtml(text)}</p>
        </div>
    `;
}

export function setPage(title, description = "") {
    const root = document.querySelector("#pageContent");
    if (root) {
        root.innerHTML = `<div class="page-title"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>`;
    }
    return root;
}

export function escapeHtml(value = "") {
    const formatted = formatErrorMessage(value);
    return String(formatted).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}
