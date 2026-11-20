import { api } from "../common/api.js";
import { setPage, escapeHtml, toast } from "../common/ui.js";

const root = setPage("Theo dõi hồ sơ ứng tuyển", "Quản lý tiến độ xét duyệt và trạng thái phản hồi từ các doanh nghiệp.");

root.insertAdjacentHTML("beforeend", `
    <!-- Thống kê trạng thái nộp đơn -->
    <div id="statsRow" class="grid grid-3" style="margin-bottom:24px"></div>

    <!-- Danh sách hồ sơ đã ứng tuyển -->
    <div id="applicationsContainer">
        <p class="muted">Đang tải lịch sử ứng tuyển...</p>
    </div>
`);

function getStatusBadge(status) {
    switch (status) {
        case "SUBMITTED":
            return `<span class="tag" style="background:#e0f2fe;color:#0369a1;font-weight:600">📄 Đã nộp hồ sơ</span>`;
        case "REVIEWING":
            return `<span class="tag" style="background:#fef3c7;color:#b45309;font-weight:600">🔍 Đang xem xét hồ sơ</span>`;
        case "ACCEPTED":
        case "INTERVIEW":
            return `<span class="tag" style="background:#dcfce7;color:#15803d;font-weight:600">🎉 Mời phỏng vấn / Trúng tuyển</span>`;
        case "REJECTED":
            return `<span class="tag" style="background:#f1f5f9;color:#64748b">Chưa phù hợp</span>`;
        case "WITHDRAWN":
            return `<span class="tag" style="background:#fee2e2;color:#991b1b;font-weight:600">✕ Đã rút hồ sơ</span>`;
        default:
            return `<span class="tag">${escapeHtml(status)}</span>`;
    }
}

async function loadApplications() {
    const statsEl = document.querySelector("#statsRow");
    const container = document.querySelector("#applicationsContainer");

    try {
        const rows = await api("/applications");

        // Tính toán số liệu thống kê
        const total = rows.length;
        const submitted = rows.filter(r => r.status === "SUBMITTED").length;
        const reviewing = rows.filter(r => r.status === "REVIEWING").length;
        const withdrawn = rows.filter(r => r.status === "WITHDRAWN").length;

        statsEl.innerHTML = `
            <div class="card" style="padding:16px 20px;text-align:center">
                <div class="stat-label">TỔNG ĐƠN ĐÃ NỘP</div>
                <div class="stat-value" style="color:var(--primary);font-size:28px">${total}</div>
            </div>
            <div class="card" style="padding:16px 20px;text-align:center">
                <div class="stat-label">ĐANG XỬ LÝ / XEM XÉT</div>
                <div class="stat-value" style="color:#d97706;font-size:28px">${submitted + reviewing}</div>
            </div>
            <div class="card" style="padding:16px 20px;text-align:center">
                <div class="stat-label">ĐÃ RÚT HỒ SƠ</div>
                <div class="stat-value" style="color:#64748b;font-size:28px">${withdrawn}</div>
            </div>
        `;

        if (!rows.length) {
            container.innerHTML = `
                <div class="card empty" style="padding:40px 20px;text-align:center">
                    <div style="font-size:40px;margin-bottom:10px">📬</div>
                    <h3 style="margin-bottom:8px">Bạn chưa nộp hồ sơ ứng tuyển nào</h3>
                    <p class="muted" style="font-size:14px;max-width:440px;margin:0 auto 18px auto">
                        Hãy chuẩn bị CV và ứng tuyển vào các vị trí công nghệ phù hợp với kỹ năng và định hướng của bạn.
                    </p>
                    <a href="/pages/jobs.html" class="button button-primary">Khám phá việc làm ngay</a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="card" style="padding:0;overflow:hidden">
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr style="background:#f8fafc">
                                <th>Vị trí ứng tuyển</th>
                                <th>Công ty</th>
                                <th>CV sử dụng</th>
                                <th>Ngày nộp đơn</th>
                                <th>Trạng thái</th>
                                <th style="text-align:right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map(a => `
                                <tr>
                                    <td>
                                        <a href="/pages/job-detail.html?id=${a.job_id}" style="font-weight:600;color:var(--primary)">
                                            ${escapeHtml(a.title)} ↗
                                        </a>
                                    </td>
                                    <td>
                                        <a href="/pages/company.html?id=${a.company_id || 1}" style="color:#334155;font-weight:500">
                                            🏢 ${escapeHtml(a.company_name)}
                                        </a>
                                    </td>
                                    <td>
                                        <span class="tag" style="background:#f1f5f9;color:#334155">
                                            📄 ${escapeHtml(a.file_name)}
                                        </span>
                                    </td>
                                    <td class="muted" style="font-size:13px">
                                        ${new Date(a.applied_at).toLocaleString("vi-VN")}
                                    </td>
                                    <td>
                                        ${getStatusBadge(a.status)}
                                    </td>
                                    <td style="text-align:right">
                                        ${a.status === "SUBMITTED" ? `
                                            <button class="button button-light" style="padding:6px 12px;font-size:12px;color:#b91c1c" data-withdraw="${a.application_id}">
                                                Rút hồ sơ
                                            </button>
                                        ` : `
                                            <span class="muted" style="font-size:12px">-</span>
                                        `}
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Gán sự kiện Rút hồ sơ
        container.querySelectorAll("[data-withdraw]").forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.withdraw;
                if (!confirm("Bạn có chắc chắn muốn rút hồ sơ ứng tuyển này? Sau khi rút hồ sơ, nhà tuyển dụng sẽ không tiếp tục xét duyệt đơn của bạn.")) {
                    return;
                }

                try {
                    btn.disabled = true;
                    btn.textContent = "Đang rút...";
                    await api(`/applications/${id}/withdraw`, { method: "PATCH" });
                    toast("Đã rút hồ sơ ứng tuyển thành công.");
                    await loadApplications();
                } catch (err) {
                    toast(err.message || "Không thể rút hồ sơ.");
                    btn.disabled = false;
                    btn.textContent = "Rút hồ sơ";
                }
            };
        });

    } catch (e) {
        container.innerHTML = `<div class="card empty"><p>Lỗi tải danh sách hồ sơ: ${escapeHtml(e.message)}</p></div>`;
    }
}

loadApplications();
