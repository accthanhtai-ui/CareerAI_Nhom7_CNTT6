import { api, json } from "../common/api.js";
import { setPage, escapeHtml, toast } from "../common/ui.js";

const jobId = new URLSearchParams(location.search).get("id");
const root = setPage("Chi tiết việc làm", "Thông tin mô tả, yêu cầu, quyền lợi và doanh nghiệp tuyển dụng.");

function getCompanyLogo(name = "") {
    const n = name.toLowerCase();
    if (n.includes("fpt")) return "/assets/logos/fpt.png";
    if (n.includes("viettel")) return "/assets/logos/viettel.png";
    if (n.includes("vng")) return "/assets/logos/vng.png";
    if (n.includes("vinai")) return "/assets/logos/vinai.png";
    if (n.includes("techcombank")) return "/assets/logos/techcombank.png";
    return "/assets/logo-icon.png";
}

function getSalaryEstimate(title = "") {
    const t = title.toLowerCase();
    if (t.includes("thực tập") || t.includes("intern")) return "5 - 10 triệu VNĐ";
    if (t.includes("ai") || t.includes("devops") || t.includes("lead") || t.includes("architect")) return "25 - 45 triệu VNĐ";
    if (t.includes("backend") || t.includes("senior")) return "20 - 35 triệu VNĐ";
    return "15 - 28 triệu VNĐ";
}

if (!jobId) {
    root.insertAdjacentHTML("beforeend", `
        <div class="card empty">
            <p>Không tìm thấy mã tin tuyển dụng.</p>
            <a href="/pages/jobs.html" class="button button-primary">Quay lại danh sách việc làm</a>
        </div>
    `);
} else {
    init();
}

async function init() {
    try {
        const [job, otherJobs, savedList] = await Promise.all([
            api(`/jobs/${jobId}`),
            api(`/companies/${jobId}/jobs?exclude_id=${jobId}`).catch(() => []),
            api(`/jobs/saved/list`).catch(() => [])
        ]);

        const logoUrl = getCompanyLogo(job.company_name);
        const salary = getSalaryEstimate(job.title);
        const deadlineStr = job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "Tuyển gấp / Đến khi đủ số lượng";
        const isSaved = Array.isArray(savedList) && savedList.some(s => String(s.job_id) === String(job.job_id));

        // Tách hoặc sinh nội dung chi tiết nếu description gộp chung
        const descText = job.description || "";
        const descHtml = `
            <p style="line-height:1.7;color:#334155;margin-bottom:16px">${escapeHtml(descText)}</p>
            <ul style="padding-left:20px;line-height:1.8;color:#334155">
                <li>Tham gia phát triển các tính năng mới trong hệ sinh thái sản phẩm công nghệ của doanh nghiệp.</li>
                <li>Phối hợp cùng Product Owner, Tech Lead và Designer để tối ưu hóa trải nghiệm người dùng.</li>
                <li>Đảm bảo hiệu năng, độ bảo mật và tính mở rộng của các module được phân công.</li>
            </ul>
        `;

        const reqHtml = `
            <ul style="padding-left:20px;line-height:1.8;color:#334155">
                <li>Tốt nghiệp hoặc sinh viên năm cuối chuyên ngành CNTT, Khoa học Máy tính hoặc tương đương.</li>
                <li>Nắm vững kiến thức nền tảng về cấu trúc dữ liệu, thuật toán và lập trình hướng đối tượng.</li>
                <li>Có kinh nghiệm thực tế với công nghệ liên quan tới vị trí tuyển dụng (React, Node.js, Python, MySQL, Git).</li>
                <li>Tư duy giải quyết vấn đề tốt, chủ động học hỏi công nghệ mới và có tinh thần làm việc nhóm cao.</li>
            </ul>
        `;

        const benHtml = `
            <ul style="padding-left:20px;line-height:1.8;color:#334155">
                <li><strong>Mức lương hấp dẫn:</strong> ${salary} (thưởng theo hiệu suất dự án và lương tháng 13).</li>
                <li><strong>Bảo hiểm:</strong> Đầy đủ BHXH, BHYT theo luật và gói bảo hiểm sức khỏe cao cấp.</li>
                <li><strong>Môi trường:</strong> Năng động, chuyên nghiệp, hỗ trợ trang thiết bị làm việc hiện đại (MacBook / Laptop cao cấp).</li>
                <li><strong>Phát triển:</strong> Được đài thọ kinh phí thi các chứng chỉ quốc tế và lộ trình thăng tiến rõ ràng.</li>
            </ul>
        `;

        root.insertAdjacentHTML("beforeend", `
            <!-- Header chi tiết tin tuyển dụng -->
            <div class="card" style="padding:28px;margin-bottom:24px;border-top:4px solid var(--primary)">
                <div class="row" style="align-items:flex-start;gap:20px">
                    <img src="${logoUrl}" alt="${escapeHtml(job.company_name)}" style="width:72px;height:72px;object-fit:contain;border:1px solid var(--line);border-radius:12px;padding:6px;background:#fff">
                    <div style="flex:1;min-width:280px">
                        <div class="row" style="gap:8px;margin-bottom:8px">
                            <span class="tag" style="background:#eef3ff;color:#244ca9;font-weight:600">Tuyển dụng chính thức</span>
                            <span class="tag" style="background:#ecfdf5;color:#047857;font-weight:700">💰 ${salary}</span>
                        </div>
                        <h1 style="font-size:24px;margin:0 0 8px 0;line-height:1.3">${escapeHtml(job.title)}</h1>
                        <div class="row" style="gap:16px;color:var(--muted);font-size:14px">
                            <span>🏢 Công ty: <a href="/pages/company.html?id=${job.company_id}" style="font-weight:600;color:var(--primary)">${escapeHtml(job.company_name)} ↗</a></span>
                            <span>📅 Hạn nộp: <strong style="color:#b91c1c">${deadlineStr}</strong></span>
                            <span>📍 Địa điểm: TP. Hồ Chí Minh / Hà Nội</span>
                        </div>
                    </div>
                </div>

                <div class="actions" style="margin-top:22px;padding-top:18px;border-top:1px solid var(--line)">
                    <button id="applyJobBtn" class="button button-primary" style="padding:11px 28px;font-size:15px">
                        ✉ Ứng tuyển ngay
                    </button>
                    <button id="saveJobBtn" class="button button-light" style="padding:11px 20px;font-size:14px">
                        ${isSaved ? "★ Đã lưu việc làm" : "☆ Lưu việc làm"}
                    </button>
                    <a href="/pages/company.html?id=${job.company_id}" class="button button-light" style="padding:11px 18px;font-size:14px">
                        🏢 Xem hồ sơ công ty
                    </a>
                </div>
            </div>

            <!-- Khu vực ứng tuyển nhanh (mặc định ẩn) -->
            <div id="applyArea" style="display:none;margin-bottom:24px"></div>

            <!-- Bố cục 2 cột: Cột nội dung tin & Cột thông tin công ty / tin khác -->
            <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;align-items:start">
                <!-- Cột chính: Mô tả, Yêu cầu, Quyền lợi -->
                <div class="stack">
                    <article class="card">
                        <h3 style="font-size:18px;margin-bottom:14px;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px">
                            📋 1. Mô tả công việc
                        </h3>
                        ${descHtml}
                    </article>

                    <article class="card">
                        <h3 style="font-size:18px;margin-bottom:14px;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px">
                            🎯 2. Yêu cầu ứng viên
                        </h3>
                        ${reqHtml}
                    </article>

                    <article class="card">
                        <h3 style="font-size:18px;margin-bottom:14px;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px">
                            🎁 3. Quyền lợi được hưởng
                        </h3>
                        ${benHtml}
                    </article>
                </div>

                <!-- Cột phụ: Thông tin công ty & Các tin khác của công ty -->
                <div class="stack">
                    <!-- Thẻ thông tin công ty tóm tắt -->
                    <div class="card" style="border:1px solid var(--line)">
                        <h4 style="margin-bottom:12px;font-size:15px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px">Về công ty</h4>
                        <div class="row" style="gap:12px;margin-bottom:12px">
                            <img src="${logoUrl}" alt="${escapeHtml(job.company_name)}" style="width:48px;height:48px;object-fit:contain;border-radius:8px;border:1px solid var(--line);padding:4px">
                            <div>
                                <strong style="font-size:16px">${escapeHtml(job.company_name)}</strong>
                                ${job.website ? `<br><a href="${job.website}" target="_blank" style="font-size:13px;color:var(--primary)">${escapeHtml(job.website)}</a>` : ""}
                            </div>
                        </div>
                        <p style="font-size:13px;line-height:1.6;color:#475569;margin-bottom:16px">
                            ${escapeHtml(job.company_description || "Doanh nghiệp công nghệ thông tin tiên phong với môi trường làm việc năng động và chế độ đãi ngộ vượt trội.")}
                        </p>
                        <a href="/pages/company.html?id=${job.company_id}" class="button button-primary" style="display:block;text-align:center;font-size:13px;padding:9px">
                            Xem trang hồ sơ công ty ↗
                        </a>
                    </div>

                    <!-- Thẻ danh sách tin khác của công ty -->
                    <div class="card">
                        <h4 style="margin-bottom:14px;font-size:15px;color:#1e293b">
                            💼 Việc làm khác của ${escapeHtml(job.company_name)}
                        </h4>
                        <div id="otherJobsContainer" class="stack" style="gap:10px">
                            <p class="muted" style="font-size:13px">Đang tải danh sách tin khác...</p>
                        </div>
                    </div>
                </div>
            </div>
        `);

        // Tải danh sách các tin khác của công ty này
        loadOtherCompanyJobs(job.company_id, job.job_id, job.company_name);

        // Sự kiện Lưu việc làm
        let savedState = isSaved;
        const saveBtn = document.querySelector("#saveJobBtn");
        saveBtn.onclick = async () => {
            try {
                if (savedState) {
                    await api(`/jobs/${job.job_id}/save`, { method: "DELETE" });
                    savedState = false;
                    saveBtn.textContent = "☆ Lưu việc làm";
                    toast("Đã bỏ lưu việc làm.");
                } else {
                    await api(`/jobs/${job.job_id}/save`, { method: "POST" });
                    savedState = true;
                    saveBtn.textContent = "★ Đã lưu việc làm";
                    toast("Đã lưu việc làm thành công.");
                }
            } catch (err) {
                toast(err.message || "Lỗi lưu việc làm.");
            }
        };

        // Sự kiện Ứng tuyển
        const applyBtn = document.querySelector("#applyJobBtn");
        const applyArea = document.querySelector("#applyArea");

        applyBtn.onclick = async () => {
            applyArea.style.display = "block";
            applyArea.scrollIntoView({ behavior: "smooth", block: "center" });

            try {
                const cvs = await api("/cvs");
                const defaultCvId = localStorage.getItem("career_ai_default_cv_id");

                if (!cvs || !cvs.length) {
                    applyArea.innerHTML = `
                        <div class="card" style="background:#fffbeb;border:1px solid #fde68a">
                            <p style="color:#92400e;margin-bottom:10px"><strong>Bạn chưa có CV nào trên hệ thống.</strong></p>
                            <a href="/pages/my-cvs.html" class="button button-primary" style="display:inline-block">Tải CV lên ngay</a>
                        </div>
                    `;
                    return;
                }

                applyArea.innerHTML = `
                    <form id="applyForm" class="card" style="border:2px solid var(--primary);background:#f8fafc">
                        <div class="row between" style="margin-bottom:12px">
                            <h3 style="margin:0;font-size:17px">Ứng tuyển vị trí: ${escapeHtml(job.title)}</h3>
                            <button type="button" id="closeApplyBtn" style="background:none;border:0;cursor:pointer;font-weight:bold">✕</button>
                        </div>
                        <div class="field">
                            <label><strong>Chọn CV ứng tuyển:</strong></label>
                            <select name="cv_id" required style="padding:10px;border-radius:8px">
                                ${cvs.map(c => `
                                    <option value="${c.cv_id}" ${String(c.cv_id) === String(defaultCvId) ? "selected" : ""}>
                                        ${escapeHtml(c.file_name)} ${String(c.cv_id) === String(defaultCvId) ? "(★ CV Mặc định)" : ""}
                                    </option>
                                `).join("")}
                            </select>
                        </div>
                        <div class="row" style="margin-top:16px;gap:12px">
                            <button type="submit" class="button button-primary">Xác nhận nộp hồ sơ</button>
                            <button type="button" id="cancelApplyBtn" class="button button-light">Hủy</button>
                        </div>
                    </form>
                `;

                document.querySelector("#closeApplyBtn").onclick = () => { applyArea.style.display = "none"; };
                document.querySelector("#cancelApplyBtn").onclick = () => { applyArea.style.display = "none"; };

                document.querySelector("#applyForm").onsubmit = async e => {
                    e.preventDefault();
                    const submitBtn = e.currentTarget.querySelector("button[type=submit]");
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Đang gửi hồ sơ...";

                    try {
                        const selectedCvId = Number(new FormData(e.currentTarget).get("cv_id"));
                        await api(`/jobs/${job.job_id}/apply`, json("POST", { cv_id: selectedCvId }));
                        toast("Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm phản hồi.");
                        applyArea.innerHTML = `
                            <div class="card" style="background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46">
                                <strong>✔ Bạn đã nộp hồ sơ ứng tuyển thành công cho vị trí này!</strong>
                            </div>
                        `;
                    } catch (err) {
                        toast(err.message || "Lỗi khi ứng tuyển.");
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Xác nhận nộp hồ sơ";
                    }
                };
            } catch (err) {
                toast(err.message);
            }
        };

    } catch (e) {
        root.innerHTML = `<div class="card empty"><p>Lỗi tải việc làm: ${escapeHtml(e.message)}</p></div>`;
    }
}

async function loadOtherCompanyJobs(companyId, currentJobId, companyName) {
    const container = document.querySelector("#otherJobsContainer");
    try {
        const jobs = await api(`/companies/${companyId}/jobs?exclude_id=${currentJobId}`);
        if (!jobs || !jobs.length) {
            container.innerHTML = `<p class="muted" style="font-size:13px">Hiện chưa có tin tuyển dụng nào khác từ ${escapeHtml(companyName)}.</p>`;
            return;
        }

        container.innerHTML = jobs.map(j => `
            <div style="padding:10px;border-radius:8px;border:1px solid var(--line);background:#fff">
                <a href="/pages/job-detail.html?id=${j.job_id}" style="font-weight:600;font-size:14px;display:block;margin-bottom:4px;color:#1e293b">
                    ${escapeHtml(j.title)}
                </a>
                <div class="row between" style="font-size:12px;color:var(--muted)">
                    <span style="color:#059669;font-weight:600">${getSalaryEstimate(j.title)}</span>
                    <span>${j.deadline ? new Date(j.deadline).toLocaleDateString("vi-VN") : "Tuyển gấp"}</span>
                </div>
            </div>
        `).join("");
    } catch {
        container.innerHTML = `<p class="muted" style="font-size:13px">Không thể tải danh sách tin khác.</p>`;
    }
}
