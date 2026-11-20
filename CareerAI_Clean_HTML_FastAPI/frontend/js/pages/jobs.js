import { api } from "../common/api.js";
import { setPage, escapeHtml } from "../common/ui.js";

const root = setPage("Tìm việc làm", "Tìm kiếm, lọc cơ hội nghề nghiệp và đối chiếu kỹ năng phù hợp.");

root.insertAdjacentHTML("beforeend", `
    <!-- Form tìm kiếm và bộ lọc nâng cao -->
    <div class="card" style="margin-bottom:20px;padding:20px">
        <form id="searchForm" class="grid" style="gap:14px">
            <div class="row" style="gap:12px;flex-wrap:wrap">
                <input name="search" id="searchInput" placeholder="🔍 Nhập từ khóa: vị trí, kỹ năng (React, Python...) hoặc tên công ty" style="flex:2;min-width:280px">
                <select name="status" id="statusFilter" style="flex:1;min-width:180px">
                    <option value="all">Tất cả trạng thái tin</option>
                    <option value="active" selected>Đang mở tuyển (Còn hạn)</option>
                    <option value="expired">Đã hết hạn / Đã đóng</option>
                </select>
                <select name="sort" id="sortFilter" style="flex:1;min-width:160px">
                    <option value="newest">Mới nhất</option>
                    <option value="deadline">Hạn nộp gần nhất</option>
                </select>
                <button class="button button-primary" type="submit" style="padding:10px 24px">
                    Tìm kiếm
                </button>
            </div>
        </form>
    </div>

    <!-- Thanh thông báo kết quả so khớp -->
    <div class="row between" style="margin-bottom:14px;padding:0 4px">
        <div id="matchSummary" style="font-size:14px;color:#334155;font-weight:600">
            Đang tải dữ liệu việc làm...
        </div>
        <span class="muted" style="font-size:12px">
            * Điểm số và mức độ so khớp kỹ năng chỉ mang tính chất tham khảo
        </span>
    </div>

    <!-- Danh sách việc làm -->
    <div id="jobList" class="stack" style="gap:14px"></div>

    <!-- Phân trang -->
    <div id="pagination" class="row between" style="margin-top:20px;align-items:center"></div>
`);

let page = 1;

function getSalaryEstimate(title = "") {
    const t = title.toLowerCase();
    if (t.includes("thực tập") || t.includes("intern")) return "5 - 10 triệu VNĐ";
    if (t.includes("ai") || t.includes("devops") || t.includes("lead") || t.includes("architect")) return "25 - 45 triệu VNĐ";
    if (t.includes("backend") || t.includes("senior")) return "20 - 35 triệu VNĐ";
    return "15 - 28 triệu VNĐ";
}

async function load() {
    const form = document.querySelector("#searchForm");
    const formData = new FormData(form);
    const searchVal = formData.get("search") || "";
    const statusVal = formData.get("status") || "active";
    const sortVal = formData.get("sort") || "newest";

    const query = new URLSearchParams({
        search: searchVal,
        status: statusVal,
        sort: sortVal,
        page: String(page)
    });

    const matchSummary = document.querySelector("#matchSummary");
    const listEl = document.querySelector("#jobList");
    const pagEl = document.querySelector("#pagination");

    try {
        const data = await api(`/jobs?${query}`);

        // Hiển thị thông báo kết quả so khớp
        if (searchVal.trim()) {
            matchSummary.innerHTML = `Kết quả so khớp: Tìm thấy <strong>${data.total}</strong> việc làm với từ khóa "<em>${escapeHtml(searchVal)}</em>"`;
        } else {
            matchSummary.innerHTML = `Hiện có <strong>${data.total}</strong> việc làm phù hợp theo bộ lọc`;
        }

        if (!data.items || !data.items.length) {
            listEl.innerHTML = `
                <div class="card empty">
                    <p style="font-size:16px;margin-bottom:8px">Không tìm thấy việc làm nào phù hợp với bộ lọc hiện tại.</p>
                    <p class="muted" style="font-size:13px">Hãy thử đổi từ khóa tìm kiếm hoặc chuyển bộ lọc trạng thái sang "Tất cả trạng thái tin".</p>
                </div>
            `;
            pagEl.innerHTML = "";
            return;
        }

        listEl.innerHTML = data.items.map(j => {
            const isExpired = Boolean(j.is_expired);
            const statusBadge = isExpired
                ? `<span class="tag" style="background:#fee2e2;color:#991b1b;font-weight:700">✕ Đã hết hạn / Đóng</span>`
                : `<span class="tag" style="background:#ecfdf5;color:#047857;font-weight:600">✔ Đang mở tuyển</span>`;

            const deadlineStr = j.deadline
                ? new Date(j.deadline).toLocaleDateString("vi-VN")
                : "Không giới hạn";

            return `
                <article class="list-item" style="${isExpired ? 'opacity:0.75;background:#f8fafc;border-color:#e2e8f0' : 'background:#fff'}">
                    <div class="row between" style="align-items:flex-start">
                        <div style="flex:1;min-width:260px">
                            <div class="row" style="gap:8px;margin-bottom:6px">
                                ${statusBadge}
                                <span class="tag" style="background:#eef2ff;color:#3730a3;font-weight:600">
                                    💰 ${getSalaryEstimate(j.title)}
                                </span>
                            </div>
                            <h3 style="margin:4px 0 6px 0;font-size:18px">
                                <a href="/pages/job-detail.html?id=${j.job_id}" style="color:${isExpired ? '#475569' : 'var(--primary)'}">
                                    ${escapeHtml(j.title)}
                                </a>
                            </h3>
                            <p class="muted" style="margin:0 0 8px 0;font-size:14px">
                                🏢 <a href="/pages/company.html?id=${j.company_id}" style="color:var(--primary);font-weight:600">${escapeHtml(j.company_name)} ↗</a>
                                <span style="margin:0 8px">·</span>
                                📅 Hạn nộp: <strong style="color:${isExpired ? '#991b1b' : '#334155'}">${deadlineStr}</strong>
                            </p>
                            <p style="margin:0;font-size:13px;line-height:1.5;color:#475569;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                                ${escapeHtml(j.description)}
                            </p>
                        </div>
                        <div class="actions" style="margin-top:8px">
                            <a class="button ${isExpired ? 'button-light' : 'button-primary'}" href="/pages/job-detail.html?id=${j.job_id}">
                                ${isExpired ? "Xem chi tiết (Đã đóng)" : "Xem chi tiết & Ứng tuyển"}
                            </a>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        pagEl.innerHTML = `
            <button class="button button-light" ${page <= 1 ? "disabled" : ""} id="prevPageBtn">← Trang trước</button>
            <span class="muted" style="font-size:13px">Trang <strong>${data.page}</strong> / ${data.pages || 1} (Tổng ${data.total} tin)</span>
            <button class="button button-light" ${page >= data.pages ? "disabled" : ""} id="nextPageBtn">Trang sau →</button>
        `;

        const prevBtn = document.querySelector("#prevPageBtn");
        const nextBtn = document.querySelector("#nextPageBtn");
        if (prevBtn) prevBtn.onclick = () => { if (page > 1) { page--; load(); } };
        if (nextBtn) nextBtn.onclick = () => { if (page < data.pages) { page++; load(); } };

    } catch (err) {
        listEl.innerHTML = `<div class="card empty"><p>Lỗi tải danh sách việc làm: ${escapeHtml(err.message)}</p></div>`;
    }
}

document.querySelector("#searchForm").onsubmit = e => {
    e.preventDefault();
    page = 1;
    load();
};

document.querySelector("#statusFilter").onchange = () => {
    page = 1;
    load();
};

document.querySelector("#sortFilter").onchange = () => {
    page = 1;
    load();
};

load();
