import { api, json } from "../common/api.js";
import { showMessage } from "../common/ui.js";

document.querySelector("#authForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submitBtn = event.currentTarget.querySelector("button[type=submit]");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Đang đăng nhập...";
    }

    try {
        const data = await api("/auth/login", json("POST", {
            email: form.get("email"),
            password: form.get("password")
        }));
        localStorage.setItem("careerai_token", data.token);
        localStorage.setItem("careerai_user", JSON.stringify(data.user));
        location.href = data.user.role === "ADMIN" ? "/pages/admin.html" : "/pages/dashboard.html";
    } catch (error) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Đăng nhập";
        }
        let msg = error.message || "";
        if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed")) {
            msg = "Không thể kết nối đến máy chủ backend. Vui lòng bật lệnh chạy server FastAPI (uvicorn) trong terminal.";
        }
        showMessage(msg, "error");
    }
});
