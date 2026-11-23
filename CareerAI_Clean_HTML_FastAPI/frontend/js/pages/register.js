import { api, json } from "../common/api.js";
import { showMessage } from "../common/ui.js";

document.querySelector("#authForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submitBtn = event.currentTarget.querySelector("button[type=submit]");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Đang đăng ký...";
    }

    try {
        await api("/auth/register", json("POST", {
            name: form.get("name"),
            email: form.get("email"),
            password: form.get("password")
        }));
        location.href = "/pages/login.html";
    } catch (error) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Đăng ký";
        }
        let msg = error.message || "";
        if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed")) {
            msg = "Không thể kết nối đến máy chủ backend. Vui lòng bật lệnh chạy server FastAPI (uvicorn) trong terminal.";
        }
        showMessage(msg, "error");
    }
});
