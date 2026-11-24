import {api,json} from "../common/api.js";
import {setPage,showMessage} from "../common/ui.js";

const root = setPage("Hồ sơ cá nhân", "Cập nhật thông tin học vấn và mục tiêu nghề nghiệp.");

try {
    const p = await api("/profile/me");
    root.insertAdjacentHTML("beforeend", `
        <form id="profileForm" class="card">
            <div class="grid grid-3">
                <label class="field">
                    <span>Họ và tên</span>
                    <input name="name" value="${p.name || ""}" required>
                </label>
                <label class="field">
                    <span style="display:flex;align-items:center;justify-content:space-between">
                        <span>Email</span>
                        <span class="tag" style="font-size:11px;background:#f1f5f9;color:#64748b;padding:2px 8px;border-radius:12px;font-weight:normal;display:inline-flex;align-items:center;gap:4px">
                            🔒 Đăng nhập (Cố định)
                        </span>
                    </span>
                    <input value="${p.email || ""}" readonly style="background:#f8fafc;color:#64748b;cursor:not-allowed;border-color:#e2e8f0" title="Email là tài khoản đăng nhập duy nhất gắn với mã xác thực JWT, không thể thay đổi trực tiếp tại đây để bảo vệ tài khoản">
                </label>
                <label class="field">
                    <span>Số điện thoại</span>
                    <input name="phone" value="${p.phone || ""}">
                </label>
                <label class="field">
                    <span>Trường học</span>
                    <input name="school" value="${p.school || ""}">
                </label>
                <label class="field">
                    <span>Ngành học</span>
                    <input name="major" value="${p.major || ""}">
                </label>
                <label class="field">
                    <span>Địa điểm</span>
                    <input name="location" value="${p.location || ""}">
                </label>
            </div>
            <label class="field">
                <span>Mục tiêu nghề nghiệp</span>
                <textarea name="career_goal" rows="4">${p.career_goal || ""}</textarea>
            </label>
            <button class="button button-primary">Lưu thay đổi</button>
        </form>
    `);

    document.querySelector("#profileForm").addEventListener("submit", async e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.currentTarget));
        try {
            await api("/profile/me", json("PUT", d));
            showMessage("Đã cập nhật hồ sơ.", "success");
        } catch (err) {
            showMessage(err.message, "error");
        }
    });
} catch (e) {
    showMessage(e.message, "error");
}
