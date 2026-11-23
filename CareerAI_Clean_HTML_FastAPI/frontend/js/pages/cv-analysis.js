import { api, json } from "../common/api.js";
import { setPage, escapeHtml, toast } from "../common/ui.js";

const DEFAULT_CV_KEY = "careerai_default_cv_id";
const root = setPage("Phân tích CV bằng AI", "Đánh giá chất lượng CV, phát hiện điểm mạnh, điểm cần cải thiện và gợi ý nghề nghiệp từ AI.");

root.insertAdjacentHTML("beforeend", `
    <!-- Cách 1: Chọn từ CV đã có trong tài khoản (Không cần tải lại) -->
    <div class="card" style="margin-bottom:20px;border-top:4px solid var(--primary);background:#f8faff">
        <h3 style="margin-bottom:6px;font-size:17px;color:#1e3a8a">
            ⚡ Cách 1: Phân tích CV đã lưu trong tài khoản (Khuyên dùng)
        </h3>
        <p class="muted" style="font-size:13px;margin-bottom:14px">
            Bạn đã tải CV lên trong mục <strong>Quản lý CV</strong>? Chọn ngay CV bên dưới để AI phân tích mà <strong>không cần tải lại file</strong>:
        </p>
        <div class="row" style="gap:12px;align-items:center">
            <select id="savedCvSelect" style="flex:1;min-width:240px;padding:11px 14px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;font-weight:500">
                <option value="">-- Đang nạp danh sách CV... --</option>
            </select>
            <button type="button" id="analyzeSavedCvBtn" class="button button-primary" style="padding:11px 24px;font-size:14px;white-space:nowrap;font-weight:600">
                ⚡ Phân tích CV này ngay
            </button>
        </div>
    </div>

    <!-- Phân cách hoặc -->
    <div class="row" style="align-items:center;margin:18px 0;gap:12px">
        <div style="flex:1;height:1px;background:var(--line)"></div>
        <span class="muted" style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Hoặc tải file PDF mới từ máy tính</span>
        <div style="flex:1;height:1px;background:var(--line)"></div>
    </div>

    <!-- Cách 2: Tải lên file PDF mới từ máy tính -->
    <div class="card">
        <h3 style="margin-bottom:6px;font-size:17px;color:#1e293b">
            📄 Cách 2: Tải lên file CV mới từ máy tính
        </h3>
        <p class="muted" style="font-size:13px;margin-bottom:14px">
            Thích hợp khi bạn muốn kiểm tra nhanh một bản CV mới khác trước khi lưu vào tài khoản.
        </p>
        <form id="analysisForm">
            <div class="upload-area" id="dropArea" style="cursor:pointer;position:relative">
                <input type="file" id="cvFileInput" name="cv" accept="application/pdf" style="display:none">
                <div style="font-size:36px;margin-bottom:8px">📄</div>
                <p><strong>Kéo thả hoặc bấm vào đây để chọn file CV (PDF)</strong></p>
                <p class="muted" style="font-size:13px;margin-bottom:12px">Hỗ trợ file PDF có lớp văn bản, tối đa 5 MB</p>
                <div id="selectedFileName" class="tag" style="background:#e0e7ff;color:#3730a3;display:none;font-size:14px;padding:6px 14px"></div>
            </div>

            <div class="row between" style="margin-top:16px">
                <span class="muted" style="font-size:13px">Hệ thống CareerAI sử dụng mô hình Gemini để phân tích nội dung.</span>
                <button type="submit" id="analyzeBtn" class="button button-primary" style="padding:11px 24px;font-size:14px">
                    ⚡ Phân tích file tải lên
                </button>
            </div>
        </form>
    </div>

    <!-- Khu vực thông báo lỗi -->
    <div id="errorAlert" class="message" style="display:none;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;margin-top:20px;border-radius:10px;padding:14px 18px">
        <div class="row between" style="align-items:flex-start">
            <div class="row" style="gap:8px">
                <strong style="font-size:16px">⚠ Lỗi:</strong>
                <span id="errorMessageText"></span>
            </div>
            <button type="button" id="closeErrorBtn" style="background:transparent;border:0;color:#991b1b;font-weight:bold;cursor:pointer;font-size:16px">✕</button>
        </div>
    </div>

    <!-- Trạng thái đang xử lý (Loading State) -->
    <div id="processingState" class="card" style="display:none;margin-top:20px;text-align:center;padding:36px 20px">
        <div style="display:inline-block;width:44px;height:44px;border:4px solid #e2e8f0;border-top-color:var(--primary);border-radius:50%;animation:spin 0.9s linear infinite;margin-bottom:14px"></div>
        <h3 style="margin-bottom:6px">AI đang phân tích hồ sơ của bạn...</h3>
        <p class="muted" id="processingStep" style="font-size:14px">Đang trích xuất nội dung văn bản từ file PDF và gửi tới AI Gemini.</p>
        <p style="font-size:12px;color:#94a3b8;margin-top:8px">Quá trình phân tích chuyên sâu có thể mất từ 5 - 15 giây. Vui lòng không đóng trang web.</p>
    </div>

    <!-- Khu vực hiển thị kết quả phân tích -->
    <div id="analysisResult" class="stack" style="margin-top:24px;display:none">
        <!-- Tổng quan & Điểm số -->
        <div class="card" style="border-top:4px solid var(--primary)">
            <div class="row between" style="align-items:flex-start">
                <div style="flex:1;min-width:280px">
                    <span class="tag" style="background:#eef3ff;color:#244ca9;margin-bottom:8px">Đánh giá tổng quan</span>
                    <h2 id="resultFileName" style="font-size:20px;margin-bottom:10px"></h2>
                    <p id="resultSummary" style="font-size:15px;line-height:1.6;color:#334155;white-space:pre-line"></p>
                </div>
                <div style="text-align:center;min-width:140px;padding:12px 20px;background:#f8fafc;border-radius:12px;border:1px solid var(--line)">
                    <div class="muted" style="font-size:12px;text-transform:uppercase;font-weight:600">Điểm CV</div>
                    <div id="resultScore" class="score" style="font-size:38px;line-height:1.1;margin:6px 0">--</div>
                    <div id="scoreLabel" class="tag" style="font-size:11px">Đang tính</div>
                </div>
            </div>

            <!-- Vị trí đề xuất -->
            <div id="recommendedRolesWrap" style="margin-top:16px;padding-top:14px;border-top:1px dashed var(--line);display:none">
                <strong style="font-size:13px;color:#475569">Vị trí công việc gợi ý phù hợp: </strong>
                <span id="recommendedRolesList"></span>
            </div>
        </div>

        <!-- 3 Cột: Điểm mạnh, Điểm cần cải thiện, Gợi ý -->
        <div class="grid grid-3">
            <div class="card" style="background:#f0fdf4;border:1px solid #bbf7d0">
                <h3 style="color:#166534;font-size:16px;display:flex;align-items:center;gap:6px;margin-bottom:12px">
                    <span style="font-size:18px">✔</span> Điểm mạnh nổi bật
                </h3>
                <ul id="strengthsList" style="padding-left:18px;margin:0;color:#14532d;line-height:1.6"></ul>
            </div>

            <div class="card" style="background:#fff7ed;border:1px solid #fed7aa">
                <h3 style="color:#9a3412;font-size:16px;display:flex;align-items:center;gap:6px;margin-bottom:12px">
                    <span style="font-size:18px">⚠</span> Điểm cần cải thiện
                </h3>
                <ul id="weaknessesList" style="padding-left:18px;margin:0;color:#7c2d12;line-height:1.6"></ul>
            </div>

            <div class="card" style="background:#eff6ff;border:1px solid #bfdbfe">
                <h3 style="color:#1e40af;font-size:16px;display:flex;align-items:center;gap:6px;margin-bottom:12px">
                    <span style="font-size:18px">💡</span> Gợi ý phát triển & tối ưu
                </h3>
                <ul id="suggestionsList" style="padding-left:18px;margin:0;color:#1e3a8a;line-height:1.6"></ul>
            </div>
        </div>

        <!-- Từ khóa kỹ năng còn thiếu -->
        <div id="missingKeywordsCard" class="card" style="display:none;background:#fdf2f8;border:1px solid #fbcfe8">
            <h3 style="color:#9d174d;font-size:16px;margin-bottom:8px">Từ khóa chuyên môn nên bổ sung vào CV:</h3>
            <div id="missingKeywordsList"></div>
        </div>

        <!-- Ghi chú kết quả mang tính tham khảo -->
        <div class="card" style="background:#f8fafc;border:1px solid var(--line);padding:14px 18px">
            <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6">
                📌 <strong>Lưu ý quan trọng:</strong> Điểm số và nhận xét từ AI chỉ mang tính chất tham khảo, không đảm bảo 100% cơ hội trúng tuyển. Bạn nên cân nhắc điều chỉnh phù hợp với định hướng nghề nghiệp thực tế.
            </p>
        </div>
    </div>

    <!-- Lịch sử phân tích CV -->
    <section class="card" style="margin-top:28px">
        <div class="row between" style="margin-bottom:14px">
            <h3 style="margin:0;font-size:18px">Lịch sử phân tích CV gần đây</h3>
            <span class="muted" style="font-size:13px">Lưu trữ các lần phân tích trước đó của bạn</span>
        </div>
        <div id="historyList" class="stack">
            <div class="loading-state" style="padding:16px;text-align:center;color:var(--muted)">Đang tải lịch sử...</div>
        </div>
    </section>
`);

// Các phần tử giao diện
const form = document.querySelector("#analysisForm");
const dropArea = document.querySelector("#dropArea");
const fileInput = document.querySelector("#cvFileInput");
const selectedFileName = document.querySelector("#selectedFileName");
const analyzeBtn = document.querySelector("#analyzeBtn");
const savedCvSelect = document.querySelector("#savedCvSelect");
const analyzeSavedCvBtn = document.querySelector("#analyzeSavedCvBtn");
const processingState = document.querySelector("#processingState");
const processingStep = document.querySelector("#processingStep");
const errorAlert = document.querySelector("#errorAlert");
const errorMessageText = document.querySelector("#errorMessageText");
const closeErrorBtn = document.querySelector("#closeErrorBtn");

function showError(msg) {
    errorMessageText.textContent = msg;
    errorAlert.style.display = "block";
    errorAlert.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideError() {
    errorAlert.style.display = "none";
}

closeErrorBtn.onclick = hideError;

// 1. Tải danh sách CV đã có trong tài khoản
async function initSavedCvs() {
    try {
        const cvs = await api("/cvs").catch(() => []);
        const defaultCvId = localStorage.getItem(DEFAULT_CV_KEY);
        const urlCvId = new URLSearchParams(location.search).get("cv_id");

        if (!cvs || !cvs.length) {
            savedCvSelect.innerHTML = `<option value="">(Chưa có CV nào trong tài khoản - hãy tải file ở Cách 2 hoặc vào Quản lý CV)</option>`;
            analyzeSavedCvBtn.disabled = true;
            return;
        }

        analyzeSavedCvBtn.disabled = false;
        savedCvSelect.innerHTML = cvs.map(c => {
            const isDefault = String(c.cv_id) === String(defaultCvId);
            const isUrlTarget = String(c.cv_id) === String(urlCvId);
            const isSelected = isUrlTarget || (!urlCvId && isDefault);
            return `
                <option value="${c.cv_id}" ${isSelected ? "selected" : ""}>
                    ${escapeHtml(c.file_name)} ${isDefault ? "(★ Mặc định)" : ""} (${c.text_length || 0} ký tự)
                </option>
            `;
        }).join("");

        // Nếu người dùng bấm từ trang Quản lý CV qua (có param ?cv_id=...), tự động kích hoạt phân tích luôn!
        if (urlCvId) {
            toast("Đã tự động chọn CV từ Quản lý CV. Đang phân tích...");
            setTimeout(() => {
                analyzeSavedCvBtn.click();
            }, 300);
        }
    } catch {
        savedCvSelect.innerHTML = `<option value="">Không thể tải danh sách CV.</option>`;
    }
}

initSavedCvs();

// 2. Xử lý nút Phân tích CV đã có (Cách 1)
analyzeSavedCvBtn.onclick = async () => {
    hideError();
    const cvId = Number(savedCvSelect.value);
    if (!cvId) {
        showError("Vui lòng chọn một CV từ danh sách.");
        return;
    }

    const selectedOption = savedCvSelect.options[savedCvSelect.selectedIndex];
    const fileName = selectedOption ? selectedOption.text.split("(")[0].trim() : "CV";

    analyzeSavedCvBtn.disabled = true;
    analyzeSavedCvBtn.textContent = "⏳ Đang phân tích...";
    processingState.style.display = "block";
    document.querySelector("#analysisResult").style.display = "none";

    let stepTimer = setTimeout(() => {
        processingStep.textContent = "Đang gửi nội dung tới Gemini AI để đánh giá điểm số và gợi ý...";
    }, 2500);

    try {
        const response = await api("/ai/analyze-existing-cv", json("POST", { cv_id: cvId }));
        toast("Phân tích CV thành công!");
        displayResult(response.fileName || fileName, response.result || {});
        loadHistory();
    } catch (err) {
        showError(err.message || "Đã xảy ra lỗi trong quá trình phân tích CV. Vui lòng kiểm tra lại file PDF.");
    } finally {
        clearTimeout(stepTimer);
        analyzeSavedCvBtn.disabled = false;
        analyzeSavedCvBtn.textContent = "⚡ Phân tích CV này ngay";
        processingState.style.display = "none";
    }
};

// 3. Xử lý tải file mới từ máy tính (Cách 2)
dropArea.onclick = () => fileInput.click();

fileInput.onchange = () => {
    hideError();
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (!file.name.toLowerCase().endsWith(".pdf")) {
            showError("Chỉ chấp nhận file định dạng PDF (.pdf).");
            fileInput.value = "";
            selectedFileName.style.display = "none";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showError("Dung lượng file vượt quá giới hạn 5 MB.");
            fileInput.value = "";
            selectedFileName.style.display = "none";
            return;
        }
        selectedFileName.textContent = `✓ Đã chọn: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
        selectedFileName.style.display = "inline-block";
    }
};

["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
        e.preventDefault();
        dropArea.style.borderColor = "var(--primary)";
        dropArea.style.background = "#f0f4ff";
    });
});

["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
        e.preventDefault();
        dropArea.style.borderColor = "#cbd5e1";
        dropArea.style.background = "";
    });
});

dropArea.addEventListener("drop", e => {
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event("change"));
    }
});

form.onsubmit = async (e) => {
    e.preventDefault();
    hideError();

    const file = fileInput.files[0];
    if (!file) {
        showError("Vui lòng chọn file CV (PDF) từ máy tính để phân tích.");
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "⏳ Đang xử lý...";
    processingState.style.display = "block";
    document.querySelector("#analysisResult").style.display = "none";

    let stepTimer = setTimeout(() => {
        processingStep.textContent = "Đang gửi dữ liệu tới Gemini AI để đánh giá điểm số và gợi ý...";
    }, 3000);

    try {
        const formData = new FormData(form);
        const response = await api("/ai/analyze-cv", {
            method: "POST",
            body: formData
        });

        toast("Phân tích CV thành công!");
        displayResult(response.fileName || file.name, response.result || {});
        loadHistory();
    } catch (err) {
        showError(err.message || "Đã xảy ra lỗi trong quá trình phân tích CV. Vui lòng kiểm tra lại file PDF có lớp văn bản.");
    } finally {
        clearTimeout(stepTimer);
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "⚡ Phân tích file tải lên";
        processingState.style.display = "none";
    }
};

// Render kết quả phân tích
function displayResult(fileName, r) {
    const resultBox = document.querySelector("#analysisResult");
    const nameEl = document.querySelector("#resultFileName");
    const summaryEl = document.querySelector("#resultSummary");
    const scoreEl = document.querySelector("#resultScore");
    const scoreLabel = document.querySelector("#scoreLabel");
    const strengthsList = document.querySelector("#strengthsList");
    const weaknessesList = document.querySelector("#weaknessesList");
    const suggestionsList = document.querySelector("#suggestionsList");
    const rolesWrap = document.querySelector("#recommendedRolesWrap");
    const rolesList = document.querySelector("#recommendedRolesList");
    const keywordsCard = document.querySelector("#missingKeywordsCard");
    const keywordsList = document.querySelector("#missingKeywordsList");

    nameEl.textContent = `CV: ${fileName}`;
    summaryEl.textContent = r.summary || "Chưa có tóm tắt đánh giá.";

    const score = r.score !== undefined && r.score !== null ? r.score : "--";
    scoreEl.textContent = score;

    if (typeof score === "number") {
        if (score >= 80) {
            scoreLabel.textContent = "Xuất sắc";
            scoreLabel.style.background = "#dcfce7";
            scoreLabel.style.color = "#15803d";
        } else if (score >= 65) {
            scoreLabel.textContent = "Khá tốt";
            scoreLabel.style.background = "#fef9c3";
            scoreLabel.style.color = "#a16207";
        } else {
            scoreLabel.textContent = "Cần cải thiện";
            scoreLabel.style.background = "#fee2e2";
            scoreLabel.style.color = "#b91c1c";
        }
    } else {
        scoreLabel.textContent = "Tham khảo";
        scoreLabel.style.background = "#f1f5f9";
        scoreLabel.style.color = "#64748b";
    }

    // Điểm mạnh
    strengthsList.innerHTML = (r.strengths && r.strengths.length)
        ? r.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join("")
        : `<li>Chưa xác định được điểm mạnh nổi bật.</li>`;

    // Điểm cần cải thiện
    weaknessesList.innerHTML = (r.weaknesses && r.weaknesses.length)
        ? r.weaknesses.map(w => `<li>${escapeHtml(w)}</li>`).join("")
        : `<li>Hồ sơ của bạn khá cân bằng, không có điểm yếu lớn.</li>`;

    // Gợi ý
    suggestionsList.innerHTML = (r.suggestions && r.suggestions.length)
        ? r.suggestions.map(sg => `<li>${escapeHtml(sg)}</li>`).join("")
        : `<li>Tiếp tục tích lũy thêm các dự án thực tế liên quan đến chuyên ngành.</li>`;

    // Vị trí gợi ý
    if (r.recommendedRoles && r.recommendedRoles.length) {
        rolesList.innerHTML = r.recommendedRoles.map(role => `
            <span class="tag" style="background:#e0e7ff;color:#3730a3;font-weight:600">${escapeHtml(role)}</span>
        `).join("");
        rolesWrap.style.display = "block";
    } else {
        rolesWrap.style.display = "none";
    }

    // Từ khóa kỹ năng còn thiếu
    if (r.missingKeywords && r.missingKeywords.length) {
        keywordsList.innerHTML = r.missingKeywords.map(kw => `
            <span class="tag" style="background:#fce7f3;color:#9d174d">${escapeHtml(kw)}</span>
        `).join("");
        keywordsCard.style.display = "block";
    } else {
        keywordsCard.style.display = "none";
    }

    resultBox.style.display = "block";
    resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Tải lịch sử phân tích
async function loadHistory() {
    const listEl = document.querySelector("#historyList");
    try {
        const rows = await api("/ai/history");
        if (!rows || !rows.length) {
            listEl.innerHTML = `<div class="card empty" style="padding:16px">Chưa có lịch sử phân tích CV nào.</div>`;
            return;
        }

        listEl.innerHTML = rows.map(item => `
            <article class="list-item row between" style="padding:12px 16px">
                <div>
                    <strong>${escapeHtml(item.file_name)}</strong>
                    <span class="muted" style="font-size:12px;margin-left:8px">
                        ${new Date(item.created_at).toLocaleString("vi-VN")}
                    </span>
                    <p class="muted" style="font-size:13px;margin:4px 0 0 0;max-width:600px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                        ${escapeHtml(item.result?.summary || "")}
                    </p>
                </div>
                <div class="row" style="gap:12px">
                    <span class="score" style="font-size:22px">${item.score ?? "--"} <span style="font-size:13px;color:var(--muted)">/100</span></span>
                    <button class="button button-light" style="padding:6px 12px;font-size:13px" data-view-history="${item.id}">
                        Xem lại
                    </button>
                </div>
            </article>
        `).join("");

        listEl.querySelectorAll("[data-view-history]").forEach(btn => {
            btn.onclick = () => {
                const found = rows.find(r => String(r.id) === btn.dataset.viewHistory);
                if (found) {
                    displayResult(found.file_name, found.result || {});
                    toast(`Đang hiển thị kết quả phân tích: ${found.file_name}`);
                }
            };
        });
    } catch {
        listEl.innerHTML = `<div class="card empty" style="padding:16px">Không thể tải lịch sử phân tích.</div>`;
    }
}

loadHistory();
