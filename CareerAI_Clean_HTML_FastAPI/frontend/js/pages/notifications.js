import { api, json } from "../common/api.js";
import { setPage, escapeHtml, toast } from "../common/ui.js";

const root = setPage("Thông báo & Hỗ trợ", "Xem các cập nhật hệ thống, trạng thái ứng tuyển và gửi yêu cầu hỗ trợ đến quản trị viên.");

let activeTab = "notifications";
let notificationsList = [];
let supportList = [];

init();

async function init() {
    try {
        const [notifs, supports] = await Promise.all([
            api("/notifications").catch(() => []),
            api("/support").catch(() => [])
        ]);
        notificationsList = Array.isArray(notifs) ? notifs : [];
        supportList = Array.isArray(supports) ? supports : [];
        render();
    } catch (e) {
        root.innerHTML = `<div class="card empty"><p>Lỗi tải dữ liệu: ${escapeHtml(e.message)}</p></div>`;
    }
}

function render() {
    const unreadCount = notificationsList.filter(n => !n.is_read).length;

    root.innerHTML = `
        <!-- Tabs điều hướng -->
        <div class="row" style="gap:12px;margin-bottom:20px;border-bottom:2px solid var(--line);padding-bottom:12px">
            <button id="tabNotifsBtn" class="button ${activeTab === 'notifications' ? 'button-primary' : 'button-light'}" style="position:relative;padding:9px 20px;font-weight:600">
                🔔 Thông báo hệ thống
                ${unreadCount > 0 ? `
                    <span style="display:inline-block;background:#ef4444;color:#fff;font-size:11px;font-weight:700;padding:2px 7px;border-radius:12px;margin-left:6px">
                        ${unreadCount}
                    </span>
                ` : ""}
            </button>
            <button id="tabSupportBtn" class="button ${activeTab === 'support' ? 'button-primary' : 'button-light'}" style="padding:9px 20px;font-weight:600">
                💬 Gửi yêu cầu hỗ trợ & Phản ánh (${supportList.length})
            </button>
        </div>

        <!-- Nội dung theo Tab -->
        <div id="tabContent"></div>
    `;

    document.querySelector("#tabNotifsBtn").onclick = () => {
        activeTab = "notifications";
        render();
    };

    document.querySelector("#tabSupportBtn").onclick = () => {
        activeTab = "support";
        render();
    };

    const container = document.querySelector("#tabContent");
    if (activeTab === "notifications") {
        renderNotificationsTab(container, unreadCount);
    } else {
        renderSupportTab(container);
    }
}

function renderNotificationsTab(container, unreadCount) {
    if (!notificationsList.length) {
        container.innerHTML = `
            <div class="card empty" style="padding:40px 20px;text-align:center">
                <div style="font-size:42px;margin-bottom:12px">🔔</div>
                <h3 style="margin-bottom:6px;font-size:18px">Bạn chưa có thông báo nào</h3>
                <p class="muted" style="font-size:14px">Khi có cập nhật mới về hồ sơ ứng tuyển hoặc tin tuyển dụng, thông báo sẽ hiển thị ở đây.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="row between" style="margin-bottom:16px;align-items:center">
            <span class="muted" style="font-size:14px">
                Tổng cộng <strong>${notificationsList.length}</strong> thông báo (${unreadCount} chưa đọc)
            </span>
            ${unreadCount > 0 ? `
                <button id="markAllReadBtn" class="button button-light" style="font-size:13px;padding:6px 14px">
                    ✔ Đánh dấu tất cả đã đọc
                </button>
            ` : ""}
        </div>

        <div class="stack" style="gap:12px">
            ${notificationsList.map(n => {
                const isUnread = !n.is_read;
                const timeStr = n.created_at ? new Date(n.created_at).toLocaleString("vi-VN") : "";
                return `
                    <article class="list-item" style="border-left:4px solid ${isUnread ? 'var(--primary)' : '#cbd5e1'};background:${isUnread ? '#f8faff' : '#ffffff'};padding:16px 20px">
                        <div class="row between" style="align-items:flex-start;margin-bottom:6px">
                            <div class="row" style="gap:8px;align-items:center">
                                <span style="font-size:16px">${isUnread ? '🔵' : '⚪'}</span>
                                <strong style="font-size:16px;color:${isUnread ? '#1e3a8a' : '#1e293b'}">${escapeHtml(n.title)}</strong>
                                ${isUnread ? `
                                    <span class="tag" style="background:#dbeafe;color:#1e40af;font-size:11px;font-weight:700">Mới</span>
                                ` : ""}
                            </div>
                            <small class="muted" style="font-size:12px">${timeStr}</small>
                        </div>
                        <p style="margin:0 0 10px 0;color:#334155;line-height:1.6;font-size:14px">${escapeHtml(n.message)}</p>
                        ${isUnread ? `
                            <div style="text-align:right">
                                <button class="button button-light mark-read-btn" data-id="${n.notification_id}" style="padding:4px 12px;font-size:12px">
                                    Đánh dấu đã đọc
                                </button>
                            </div>
                        ` : ""}
                    </article>
                `;
            }).join("")}
        </div>
    `;

    const markAllBtn = container.querySelector("#markAllReadBtn");
    if (markAllBtn) {
        markAllBtn.onclick = async () => {
            markAllBtn.disabled = true;
            markAllBtn.textContent = "Đang xử lý...";
            try {
                await api("/notifications/read-all", json("PUT", {}));
                notificationsList.forEach(n => n.is_read = true);
                toast("Đã đánh dấu tất cả thông báo là đã đọc.");
                render();
            } catch (err) {
                toast(err.message || "Lỗi khi cập nhật.");
                markAllBtn.disabled = false;
                markAllBtn.textContent = "✔ Đánh dấu tất cả đã đọc";
            }
        };
    }

    container.querySelectorAll(".mark-read-btn").forEach(btn => {
        btn.onclick = async (e) => {
            const notifId = Number(e.currentTarget.getAttribute("data-id"));
            e.currentTarget.disabled = true;
            try {
                await api(`/notifications/${notifId}/read`, json("PUT", {}));
                const target = notificationsList.find(n => n.notification_id === notifId);
                if (target) target.is_read = true;
                toast("Đã đánh dấu thông báo là đã đọc.");
                render();
            } catch (err) {
                toast(err.message || "Lỗi khi cập nhật.");
                e.currentTarget.disabled = false;
            }
        };
    });
}

function renderSupportTab(container) {
    container.innerHTML = `
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:24px;align-items:start">
            <!-- Form gửi yêu cầu hỗ trợ mới -->
            <div class="card" style="padding:24px;border:1px solid var(--line)">
                <h3 style="font-size:18px;margin-bottom:8px;color:#1e293b">✉ Gửi yêu cầu hỗ trợ mới</h3>
                <p class="muted" style="font-size:13px;margin-bottom:18px;line-height:1.5">
                    Bạn gặp sự cố kỹ thuật, lỗi trích xuất CV hay cần đóng góp ý kiến? Hãy gửi yêu cầu để ban quản trị CareerAI hỗ trợ giải quyết.
                </p>

                <!-- Hiển thị trạng thái đã gửi hoặc lỗi -->
                <div id="supportFeedback" style="display:none;margin-bottom:16px;padding:12px 16px;border-radius:8px"></div>

                <form id="supportForm" class="stack" style="gap:14px">
                    <div class="field">
                        <label style="font-weight:600;font-size:13px;display:block;margin-bottom:6px">Chủ đề hỗ trợ / Sự cố: *</label>
                        <input type="text" id="supportSubject" required placeholder="Ví dụ: Sự cố không đọc được CV dạng 2 cột, Lỗi tìm việc làm..." style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--line)">
                    </div>

                    <div class="field">
                        <label style="font-weight:600;font-size:13px;display:block;margin-bottom:6px">Chi tiết nội dung yêu cầu: *</label>
                        <textarea id="supportContent" required rows="5" placeholder="Mô tả cụ thể sự việc, thông báo lỗi nếu có và mong muốn hỗ trợ..." style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--line);resize:vertical"></textarea>
                    </div>

                    <div class="row" style="margin-top:6px">
                        <button type="submit" id="submitSupportBtn" class="button button-primary" style="padding:10px 24px;font-size:14px;font-weight:600">
                            Gửi yêu cầu hỗ trợ
                        </button>
                    </div>
                </form>
            </div>

            <!-- Danh sách lịch sử yêu cầu hỗ trợ đã gửi -->
            <div class="stack" style="gap:14px">
                <div class="card" style="padding:20px;border:1px solid var(--line)">
                    <div class="row between" style="margin-bottom:14px;align-items:center">
                        <h4 style="margin:0;font-size:16px;color:#1e293b">📋 Lịch sử yêu cầu đã gửi</h4>
                        <span class="tag" style="background:#e2e8f0;color:#334155;font-weight:600">${supportList.length} yêu cầu</span>
                    </div>

                    ${supportList.length === 0 ? `
                        <p class="muted" style="font-size:13px;margin:0">Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
                    ` : `
                        <div class="stack" style="gap:12px;max-height:480px;overflow-y:auto">
                            ${supportList.map(s => {
                                const timeStr = s.created_at ? new Date(s.created_at).toLocaleString("vi-VN") : "";
                                return `
                                    <div style="padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:#f8fafc">
                                        <div class="row between" style="margin-bottom:6px;gap:8px">
                                            <strong style="font-size:14px;color:#0f172a">${escapeHtml(s.subject)}</strong>
                                            <small class="muted" style="font-size:11px;white-space:nowrap">${timeStr}</small>
                                        </div>
                                        <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;white-space:pre-wrap">${escapeHtml(s.content)}</p>
                                        <div style="margin-top:8px">
                                            <span class="tag" style="background:#ecfdf5;color:#047857;font-size:11px;font-weight:600">
                                                ✔ Đã tiếp nhận
                                            </span>
                                        </div>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;

    const supportForm = container.querySelector("#supportForm");
    const feedbackBox = container.querySelector("#supportFeedback");
    const submitBtn = container.querySelector("#submitSupportBtn");

    supportForm.onsubmit = async (e) => {
        e.preventDefault();
        const subject = container.querySelector("#supportSubject").value.trim();
        const content = container.querySelector("#supportContent").value.trim();

        if (!subject || !content) {
            feedbackBox.style.display = "block";
            feedbackBox.style.background = "#fef2f2";
            feedbackBox.style.border = "1px solid #fecaca";
            feedbackBox.style.color = "#991b1b";
            feedbackBox.innerHTML = "<strong>✕ Vui lòng điền đầy đủ tiêu đề và nội dung yêu cầu.</strong>";
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Đang gửi yêu cầu...";
        feedbackBox.style.display = "none";

        try {
            const res = await api("/support", json("POST", { subject, content }));
            toast(res.message || "Đã gửi yêu cầu hỗ trợ thành công.");
            
            // Cập nhật phản hồi thành công (trạng thái đã gửi)
            feedbackBox.style.display = "block";
            feedbackBox.style.background = "#ecfdf5";
            feedbackBox.style.border = "1px solid #a7f3d0";
            feedbackBox.style.color = "#065f46";
            feedbackBox.innerHTML = `
                <strong>✔ Đã gửi yêu cầu hỗ trợ thành công!</strong>
                <p style="margin:4px 0 0 0;font-size:13px">Yêu cầu của bạn đã được chuyển đến bộ phận Quản trị viên CareerAI để xem xét và phản hồi.</p>
            `;

            supportForm.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = "Gửi yêu cầu hỗ trợ";

            // Tải lại danh sách hỗ trợ
            const updated = await api("/support").catch(() => []);
            supportList = Array.isArray(updated) ? updated : [];
            render();
            // Chuyển lại tab support
            activeTab = "support";
            const newContainer = document.querySelector("#tabContent");
            if (newContainer) renderSupportTab(newContainer);
        } catch (err) {
            // Hiển thị trạng thái lỗi
            submitBtn.disabled = false;
            submitBtn.textContent = "Gửi yêu cầu hỗ trợ";
            feedbackBox.style.display = "block";
            feedbackBox.style.background = "#fef2f2";
            feedbackBox.style.border = "1px solid #fecaca";
            feedbackBox.style.color = "#991b1b";
            feedbackBox.innerHTML = `<strong>✕ Lỗi khi gửi yêu cầu:</strong> ${escapeHtml(err.message || "Có lỗi xảy ra, vui lòng thử lại.")}`;
            toast(err.message || "Lỗi khi gửi yêu cầu.");
        }
    };
}
