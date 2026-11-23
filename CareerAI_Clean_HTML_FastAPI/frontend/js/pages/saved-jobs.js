import { api, json } from "../common/api.js";
import { setPage, escapeHtml, toast } from "../common/ui.js";

const root = setPage("Việc làm đã lưu", "Quản lý danh sách các cơ hội nghề nghiệp bạn đã lưu để theo dõi và nộp hồ sơ.");

root.insertAdjacentHTML("beforeend", `
    <div class="row between" style="margin-bottom:16px">
        <div id="savedCount" style="font-size:15px;font-weight:600;color:#334155">
            Đang tải danh sách...
        </div>
        <a href="/pages/jobs.html" class="button button-light" style="font-size:13px;padding:8px 16px">
            + Tìm kiếm thêm việc làm
        </a>
    </div>

    <!-- Danh sách việc làm đã lưu -->
    <div id="savedListContainer" class="stack" style="gap:14px"></div>

    <!-- Modal ứng tuyển nhanh -->
    <div id="quickApplyModal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.6);z-index:9999;align-items:center;justify-content:center;padding:16px">
        <div style="background:#fff;border-radius:14px;max-width:520px;width:100%;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25)">
            <div class="row between" style="padding:16px 20px;border-bottom:1px solid var(--line);background:#f8fafc">
                <strong id="modalJobTitle" style="font-size:16px;color:#1e293b">Ứng tuyển việc làm</strong>
                <button id="closeQuickApplyBtn" style="background:none;border:0;cursor:pointer;font-size:16px;font-weight:bold">✕</button>
            </div>
            <form id="quickApplyForm" style="padding:20px">
                <input type="hidden" id="applyJobId" name="job_id">
                <div class="field" style="margin-top:0">
                    <label><strong>Chọn CV từ tài khoản của bạn:</strong></label>
                    <select id="applyCvSelect" name="cv_id" required style="padding:10px;border-radius:8px;margin-top:6px"></select>
                    <p class="muted" style="font-size:12px;margin-top:6px">
                        * Bạn có thể tải thêm CV mới tại trang <a href="/pages/my-cvs.html" style="color:var(--primary);font-weight:600">Quản lý CV ↗</a>
                    </p>
                </div>
                <div class="row" style="margin-top:20px;gap:10px;justify-content:flex-end">
                    <button type="button" id="cancelQuickApplyBtn" class="button button-light">Hủy bỏ</button>
                    <button type="submit" id="submitQuickApplyBtn" class="button button-primary">Xác nhận nộp đơn</button>
                </div>
            </form>
        </div>
    </div>
`);

function getSalaryEstimate(title = "") {
    const t = title.toLowerCase();
    if (t.includes("thực tập") || t.includes("intern")) return "5 - 10 triệu VNĐ";
    if (t.includes("ai") || t.includes("devops") || t.includes("lead") || t.includes("architect")) return "25 - 45 triệu VNĐ";
    if (t.includes("backend") || t.includes("senior")) return "20 - 35 triệu VNĐ";
    return "15 - 28 triệu VNĐ";
}

let cvListCache = null;

async function getAvailableCvs() {
    if (!cvListCache) {
        cvListCache = await api("/cvs").catch(() => []);
    }
    return cvListCache;
}

async function loadSavedJobs() {
    const countEl = document.querySelector("#savedCount");
    const container = document.querySelector("#savedListContainer");

    try {
        const rows = await api("/jobs/saved/list");

        countEl.textContent = `Tổng cộng: ${rows.length} việc làm đã lưu`;

        if (!rows.length) {
            container.innerHTML = `
                <div class="card empty" style="padding:40px 20px;text-align:center">
                    <div style="font-size:40px;margin-bottom:10px">🔖</div>
                    <h3 style="margin-bottom:8px">Bạn chưa lưu công việc nào</h3>
                    <p class="muted" style="font-size:14px;max-width:440px;margin:0 auto 18px auto">
                        Khi thấy cơ hội việc làm hấp dẫn, hãy bấm "Lưu việc làm" để dễ dàng xem lại và so sánh trước khi nộp hồ sơ.
                    </p>
                    <a href="/pages/jobs.html" class="button button-primary">Khám phá việc làm ngay</a>
                </div>
            `;
            return;
        }

        container.innerHTML = rows.map(j => {
            const isExpired = Boolean(j.is_expired);
            const deadlineStr = j.deadline ? new Date(j.deadline).toLocaleDateString("vi-VN") : "Tuyển gấp";

            return `
                <article class="list-item" style="background:#fff;border:1px solid var(--line);border-radius:12px;padding:18px">
                    <div class="row between" style="align-items:flex-start">
                        <div style="flex:1;min-width:280px">
                            <div class="row" style="gap:8px;margin-bottom:6px">
                                ${isExpired
                                    ? `<span class="tag" style="background:#fee2e2;color:#991b1b;font-weight:700">✕ Đã hết hạn / Đóng</span>`
                                    : `<span class="tag" style="background:#ecfdf5;color:#047857;font-weight:600">✔ Đang mở tuyển</span>`
                                }
                                <span class="tag" style="background:#eef2ff;color:#3730a3;font-weight:600">
                                    💰 ${getSalaryEstimate(j.title)}
                                </span>
                            </div>
                            <h3 style="margin:4px 0 6px 0;font-size:18px">
                                <a href="/pages/job-detail.html?id=${j.job_id}" style="color:var(--primary)">
                                    ${escapeHtml(j.title)}
                                </a>
                            </h3>
                            <p class="muted" style="margin:0 0 10px 0;font-size:14px">
                                🏢 <a href="/pages/company.html?id=${j.company_id || 1}" style="font-weight:600;color:var(--primary)">${escapeHtml(j.company_name)} ↗</a>
                                <span style="margin:0 8px">·</span>
                                📅 Hạn nộp: <strong style="color:${isExpired ? '#991b1b' : '#334155'}">${deadlineStr}</strong>
                            </p>
                            <p style="margin:0;font-size:13px;line-height:1.5;color:#475569;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                                ${escapeHtml(j.description)}
                            </p>
                        </div>
                        <div class="actions" style="margin-top:6px;gap:8px">
                            ${!isExpired ? `
                                <button class="button button-primary" style="font-size:13px;padding:8px 16px" data-quick-apply="${j.job_id}" data-title="${escapeHtml(j.title)}">
                                    ✉ Ứng tuyển ngay
                                </button>
                            ` : `
                                <span class="tag" style="background:#f1f5f9;color:#64748b">Hết hạn</span>
                            `}
                            <a class="button button-light" href="/pages/job-detail.html?id=${j.job_id}" style="font-size:13px;padding:8px 14px">
                                Chi tiết
                            </a>
                            <button class="button button-light" style="font-size:13px;padding:8px 14px;color:#b91c1c" data-unsave="${j.job_id}">
                                ☆ Bỏ lưu
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        // Gán sự kiện Bỏ lưu việc làm
        container.querySelectorAll("[data-unsave]").forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.unsave;
                try {
                    await api(`/jobs/${id}/save`, { method: "DELETE" });
                    toast("Đã bỏ lưu việc làm.");
                    await loadSavedJobs();
                } catch (err) {
                    toast(err.message || "Lỗi khi bỏ lưu.");
                }
            };
        });

        // Gán sự kiện Ứng tuyển nhanh
        container.querySelectorAll("[data-quick-apply]").forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.quickApply;
                const title = btn.dataset.title;
                await openQuickApply(id, title);
            };
        });

    } catch (e) {
        container.innerHTML = `<div class="card empty"><p>Lỗi tải việc làm đã lưu: ${escapeHtml(e.message)}</p></div>`;
    }
}

// Xử lý modal ứng tuyển nhanh
const modal = document.querySelector("#quickApplyModal");
const jobTitleEl = document.querySelector("#modalJobTitle");
const jobIdInput = document.querySelector("#applyJobId");
const cvSelect = document.querySelector("#applyCvSelect");
const form = document.querySelector("#quickApplyForm");

async function openQuickApply(jobId, jobTitle) {
    const cvs = await getAvailableCvs();
    if (!cvs.length) {
        toast("Bạn chưa tải lên CV nào. Vui lòng tải CV trước khi nộp đơn.");
        location.href = "/pages/my-cvs.html";
        return;
    }

    const defaultCvId = localStorage.getItem("career_ai_default_cv_id");

    cvSelect.innerHTML = cvs.map(c => `
        <option value="${c.cv_id}" ${String(c.cv_id) === String(defaultCvId) ? "selected" : ""}>
            ${escapeHtml(c.file_name)} ${String(c.cv_id) === String(defaultCvId) ? "(★ CV Mặc định)" : ""}
        </option>
    `).join("");

    jobTitleEl.textContent = `Ứng tuyển: ${jobTitle}`;
    jobIdInput.value = jobId;
    modal.style.display = "flex";
}

function closeQuickApply() {
    modal.style.display = "none";
}

document.querySelector("#closeQuickApplyBtn").onclick = closeQuickApply;
document.querySelector("#cancelQuickApplyBtn").onclick = closeQuickApply;
modal.onclick = (e) => { if (e.target.id === "quickApplyModal") closeQuickApply(); };

form.onsubmit = async e => {
    e.preventDefault();
    const submitBtn = document.querySelector("#submitQuickApplyBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang gửi hồ sơ...";

    const jobId = jobIdInput.value;
    const cvId = Number(cvSelect.value);

    try {
        await api(`/jobs/${jobId}/apply`, json("POST", { cv_id: cvId }));
        toast("Ứng tuyển thành công! Bạn có thể theo dõi tiến độ tại trang Ứng tuyển.");
        closeQuickApply();
    } catch (err) {
        toast(err.message || "Lỗi khi ứng tuyển.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Xác nhận nộp đơn";
    }
};

loadSavedJobs();
