import { api, json } from "../common/api.js";
import { toast } from "../common/ui.js";

// Khởi tạo các hàm toàn cục cho nút bấm HTML (flip card & toggle password)
window.flipAuthCard = function () {
    const card = document.getElementById("authCard");
    if (card) {
        card.classList.toggle("flipped");
    }
};

window.toggleAuthPassword = function (id, button) {
    const input = document.getElementById(id);
    if (!input) return;
    const icon = button ? button.querySelector("i") : null;
    
    if (input.type === "password") {
        input.type = "text";
        if (icon) {
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        }
    } else {
        input.type = "password";
        if (icon) {
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    }
};

// 1. Xử lý Form Đăng nhập
const loginForm = document.querySelector("#loginForm");
const loginMsg = document.querySelector("#loginMessage");

if (loginForm) {
    loginForm.addEventListener("submit", async event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const submitBtn = document.querySelector("#loginSubmitBtn");
        
        if (loginMsg) {
            loginMsg.style.display = "none";
            loginMsg.className = "auth-msg-box";
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "ĐANG ĐĂNG NHẬP...";
        }

        try {
            const data = await api("/auth/login", json("POST", {
                email: form.get("email"),
                password: form.get("password")
            }));
            
            localStorage.setItem("careerai_token", data.token);
            localStorage.setItem("careerai_user", JSON.stringify(data.user));
            sessionStorage.setItem("cv_just_logged_in", "true");
            toast("Đăng nhập thành công!", "success");
            
            setTimeout(() => {
                location.href = data.user.role === "ADMIN" ? "/pages/admin.html" : "/pages/dashboard.html";
            }, 500);
        } catch (error) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "ĐĂNG NHẬP";
            }
            let msg = error.message || "Đăng nhập không thành công.";
            if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed")) {
                msg = "Không thể kết nối đến máy chủ backend (FastAPI). Vui lòng kiểm tra lại dịch vụ đang chạy.";
            }
            if (loginMsg) {
                loginMsg.textContent = msg;
                loginMsg.className = "auth-msg-box error";
                loginMsg.style.display = "block";
            } else {
                alert(msg);
            }
        }
    });
}

// 2. Xử lý Form Đăng ký (trên mặt sau của thẻ 3D)
const signupForm = document.querySelector("#signupForm");
const signupMsg = document.querySelector("#signupMessage");

if (signupForm) {
    signupForm.addEventListener("submit", async event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const submitBtn = document.querySelector("#signupSubmitBtn");
        const password = form.get("password");
        const confirmPassword = form.get("confirmPassword");

        if (signupMsg) {
            signupMsg.style.display = "none";
            signupMsg.className = "auth-msg-box";
        }

        // Kiểm tra khớp mật khẩu
        if (password !== confirmPassword) {
            if (signupMsg) {
                signupMsg.textContent = "Mật khẩu xác nhận không trùng khớp! Vui lòng kiểm tra lại.";
                signupMsg.className = "auth-msg-box error";
                signupMsg.style.display = "block";
            }
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "ĐANG TẠO TÀI KHOẢN...";
        }

        try {
            await api("/auth/register", json("POST", {
                name: form.get("name"),
                email: form.get("email"),
                password: password
            }));

            toast("Tạo tài khoản thành công! Đang chuyển sang màn hình Đăng nhập...", "success");
            
            if (signupMsg) {
                signupMsg.textContent = "Đăng ký thành công! Bạn có thể đăng nhập ngay.";
                signupMsg.className = "auth-msg-box success";
                signupMsg.style.display = "block";
            }

            // Điền sẵn email vừa đăng ký vào ô đăng nhập
            const loginEmailInput = document.querySelector("#loginEmail");
            if (loginEmailInput) {
                loginEmailInput.value = form.get("email");
            }

            // Lật thẻ về mặt đăng nhập sau 1.2s
            setTimeout(() => {
                window.flipAuthCard();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "TẠO TÀI KHOẢN";
                }
            }, 1200);

        } catch (error) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "TẠO TÀI KHOẢN";
            }
            let msg = error.message || "Đăng ký không thành công.";
            if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed")) {
                msg = "Không thể kết nối đến máy chủ backend (FastAPI). Vui lòng kiểm tra lại dịch vụ đang chạy.";
            }
            if (signupMsg) {
                signupMsg.textContent = msg;
                signupMsg.className = "auth-msg-box error";
                signupMsg.style.display = "block";
            } else {
                alert(msg);
            }
        }
    });
}
