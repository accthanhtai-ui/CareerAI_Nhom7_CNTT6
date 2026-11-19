import { api } from "../common/api.js";
import { setPage, escapeHtml, toast } from "../common/ui.js";

const companyId = new URLSearchParams(location.search).get("id");
const root = setPage("Hồ sơ công ty", "Thông tin doanh nghiệp, môi trường văn hóa và danh sách các vị trí đang tuyển dụng.");

function getCompanyLogo(name = "") {
    const n = name.toLowerCase();
    if (n.includes("fpt")) return "/assets/logos/fpt.png";
    if (n.includes("viettel")) return "/assets/logos/viettel.png";
    if (n.includes("vng")) return "/assets/logos/vng.png";
    if (n.includes("vinai")) return "/assets/logos/vinai.png";
    if (n.includes("techcombank")) return "/assets/logos/techcombank.png";
    return "/assets/logo-icon.png";
}

function getCompanyMeta(name = "") {
    const n = name.toLowerCase();
    if (n.includes("fpt")) {
        return {
            size: "30.000+ nhân viên",
            hq: "Tòa nhà FPT Cầu Giấy, Hà Nội & Khu Công nghệ cao TP.HCM",
            industry: "Công nghệ thông tin & Chuyển đổi số",
            coverBg: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
        };
    }
    if (n.includes("viettel")) {
        return {
            size: "50.000+ nhân viên toàn cầu",
            hq: "Tòa nhà Viettel, Cầu Giấy, Hà Nội",
            industry: "Viễn thông, An ninh mạng & Công nghệ số",
            coverBg: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"
        };
    }
    if (n.includes("vng")) {
        return {
            size: "4.000+ nhân viên",
            hq: "VNG Campus, Quận 7, TP. Hồ Chí Minh",
            industry: "Internet, Trò chơi trực tuyến & Fintech",
            coverBg: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)"
        };
    }
    if (n.includes("vinai")) {
        return {
            size: "300+ nhà khoa học & kỹ sư AI",
            hq: "Tòa nhà Symphony, Vinhomes Riverside, Long Biên, Hà Nội",
            industry: "Nghiên cứu & Ứng dụng Trí tuệ Nhân tạo (AI)",
            coverBg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
        };
    }
    if (n.includes("techcombank")) {
        return {
            size: "12.000+ nhân viên",
            hq: "6 Quang Trung, Hoàn Kiếm, Hà Nội",
            industry: "Ngân hàng số & Dịch vụ Tài chính",
            coverBg: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)"
        };
    }
    return {
        size: "500 - 1.000 nhân viên",
        hq: "TP. Hồ Chí Minh & Hà Nội",
        industry: "Phần mềm & Dịch vụ CNTT",
        coverBg: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
    };
}

if (!companyId) {
    root.insertAdjacentHTML("beforeend", `
        <div class="card empty">
            <p>Không tìm thấy mã công ty.</p>
            <a href="/pages/jobs.html" class="button button-primary">Xem danh sách việc làm</a>
        </div>
    `);
} else {
    loadCompany();
}

async function loadCompany() {
    try {
        const company = await api(`/companies/${companyId}`);
        const logoUrl = getCompanyLogo(company.name);
        const meta = getCompanyMeta(company.name);
        const topbarTitle = document.querySelector("#topbarTitle");
        if (topbarTitle) topbarTitle.textContent = company.name;

        const jobs = company.jobs || [];

        root.insertAdjacentHTML("beforeend", `
            <!-- Banner Hồ sơ công ty (Khác biệt hoàn toàn so với trang chi tiết tin) -->
            <div style="border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);background:#fff;margin-bottom:24px;border:1px solid var(--line)">
                <div style="height:150px;background:${meta.coverBg};position:relative;padding:24px">
                    <span class="tag" style="background:rgba(255,255,255,0.25);color:#fff;backdrop-filter:blur(4px);font-weight:600">
                        🏢 Trang Hồ sơ Doanh nghiệp
                    </span>
                </div>
                <div style="padding:0 30px 24px 30px;position:relative">
                    <div class="row between" style="align-items:flex-end;margin-top:-50px;margin-bottom:16px">
                        <img src="${logoUrl}" alt="${escapeHtml(company.name)}" style="width:105px;height:105px;object-fit:contain;background:#fff;border-radius:16px;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,0.12);padding:8px">
                        <div class="actions">
                            ${company.website ? `
                                <a href="${company.website}" target="_blank" class="button button-primary" style="padding:9px 18px;font-size:14px">
                                    🌐 Trang web chính thức ↗
                                </a>
                            ` : ""}
                            <a href="/pages/jobs.html" class="button button-light" style="padding:9px 18px;font-size:14px">
                                ← Tìm việc khác
                            </a>
                        </div>
                    </div>

                    <div class="row" style="gap:10px;margin-bottom:8px">
                        <h1 style="font-size:26px;margin:0">${escapeHtml(company.name)}</h1>
                        <span class="tag" style="background:#ecfdf5;color:#047857;font-weight:700">✔ Đã xác thực</span>
                    </div>

                    <div class="grid grid-3" style="margin-top:18px;background:#f8fafc;padding:16px 20px;border-radius:12px;border:1px solid var(--line)">
                        <div>
                            <span class="muted" style="font-size:12px">NGÀNH NGHỀ</span>
                            <div style="font-weight:600;font-size:14px;color:#1e293b;margin-top:4px">${meta.industry}</div>
                        </div>
                        <div>
                            <span class="muted" style="font-size:12px">QUY MÔ NHÂN SỰ</span>
                            <div style="font-weight:600;font-size:14px;color:#1e293b;margin-top:4px">${meta.size}</div>
                        </div>
                        <div>
                            <span class="muted" style="font-size:12px">TRỤ SỞ CHÍNH</span>
                            <div style="font-weight:600;font-size:14px;color:#1e293b;margin-top:4px">${meta.hq}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Nội dung chi tiết hồ sơ công ty -->
            <div style="display:grid;grid-template-columns:1.8fr 1.2fr;gap:24px;align-items:start">
                <!-- Cột trái: Giới thiệu & Văn hóa công ty -->
                <div class="stack">
                    <article class="card">
                        <h3 style="font-size:18px;margin-bottom:14px;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px">
                            📖 Giới thiệu về ${escapeHtml(company.name)}
                        </h3>
                        <p style="font-size:15px;line-height:1.75;color:#334155;margin-bottom:16px">
                            ${escapeHtml(company.description || "Công ty công nghệ uy tín hàng đầu, sở hữu đội ngũ nhân sự chất lượng cao và môi trường làm việc chuẩn quốc tế.")}
                        </p>
                        <p style="font-size:14px;line-height:1.7;color:#475569">
                            Chúng tôi luôn nỗ lực kiến tạo môi trường đổi mới sáng tạo, nơi mỗi cá nhân đều có cơ hội phát triển tối đa tiềm năng và đóng góp trực tiếp vào những sản phẩm công nghệ có ảnh hưởng lớn đến hàng triệu người dùng.
                        </p>
                    </article>

                    <article class="card">
                        <h3 style="font-size:18px;margin-bottom:14px;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px">
                            🌟 Văn hóa & Đặc quyền làm việc
                        </h3>
                        <div class="stack" style="gap:12px">
                            <div class="row" style="gap:12px">
                                <span style="font-size:22px">🚀</span>
                                <div>
                                    <strong style="font-size:14px">Lộ trình thăng tiến minh bạch</strong>
                                    <p class="muted" style="font-size:13px;margin:2px 0 0 0">Đánh giá hiệu suất định kỳ 6 tháng/lần với cơ hội tăng lương và thăng cấp rõ ràng.</p>
                                </div>
                            </div>
                            <div class="row" style="gap:12px">
                                <span style="font-size:22px">💻</span>
                                <div>
                                    <strong style="font-size:14px">Thiết bị làm việc cao cấp</strong>
                                    <p class="muted" style="font-size:13px;margin:2px 0 0 0">Cung cấp MacBook Pro / Laptop đồ họa cấu hình cao cùng màn hình phụ 4K.</p>
                                </div>
                            </div>
                            <div class="row" style="gap:12px">
                                <span style="font-size:22px">🏝</span>
                                <div>
                                    <strong style="font-size:14px">Cân bằng cuộc sống & Công việc</strong>
                                    <p class="muted" style="font-size:13px;margin:2px 0 0 0">Chế độ nghỉ phép 15 ngày/năm, du lịch nghỉ dưỡng cao cấp cùng gia đình hàng năm.</p>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>

                <!-- Cột phải: Toàn bộ danh sách vị trí đang tuyển của công ty -->
                <div class="card" style="border:1px solid var(--line)">
                    <div class="row between" style="margin-bottom:16px;border-bottom:2px solid #e2e8f0;padding-bottom:10px">
                        <h3 style="font-size:17px;margin:0;color:#1e293b">
                            💼 Vị trí đang tuyển (${jobs.length})
                        </h3>
                        <span class="tag" style="background:#eef2ff;color:#3730a3;font-size:12px">Đang mở tuyển</span>
                    </div>

                    <div class="stack" style="gap:12px">
                        ${jobs.length ? jobs.map(j => `
                            <div style="border:1px solid var(--line);border-radius:10px;padding:14px;background:#fff;transition:transform 0.15s">
                                <a href="/pages/job-detail.html?id=${j.job_id}" style="font-size:15px;font-weight:700;color:var(--primary);display:block;margin-bottom:6px">
                                    ${escapeHtml(j.title)}
                                </a>
                                <p class="muted" style="font-size:13px;margin:0 0 10px 0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                                    ${escapeHtml(j.description)}
                                </p>
                                <div class="row between" style="font-size:12px">
                                    <span style="color:#b91c1c">📅 Hạn: ${j.deadline ? new Date(j.deadline).toLocaleDateString("vi-VN") : "Tuyển gấp"}</span>
                                    <a href="/pages/job-detail.html?id=${j.job_id}" class="button button-light" style="padding:5px 12px;font-size:12px">
                                        Xem chi tiết ↗
                                    </a>
                                </div>
                            </div>
                        `).join("") : `
                            <div class="empty" style="padding:20px;text-align:center">
                                Công ty hiện chưa có tin tuyển dụng nào khác.
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `);
    } catch (e) {
        root.innerHTML = `<div class="card empty"><p>Lỗi tải hồ sơ công ty: ${escapeHtml(e.message)}</p></div>`;
    }
}
