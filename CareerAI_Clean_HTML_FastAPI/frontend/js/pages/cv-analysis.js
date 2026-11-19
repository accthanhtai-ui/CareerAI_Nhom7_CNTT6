import { api } from "../common/api.js";
import { setPage, escapeHtml, toast } from "../common/ui.js";

const root = setPage("Phân tích CV bằng AI", "Đánh giá chất lượng CV, phát hiện điểm mạnh, điểm cần cải thiện và gợi ý nghề nghiệp từ AI.");

root.insertAdjacentHTML("beforeend", `
    <!-- Form Phân tích CV -->
    <div class="card">
        <form id="analysisForm">
            <div class="upload-area" id="dropArea" style="cursor:pointer;position:relative">
                <input type="file" id="cvFileInput" name="cv" accept="application/pdf" required style="display:none">
                <div style="font-size:36px;margin-bottom:8px">📄</div>
                <p><strong>Kéo thả hoặc bấm vào đây để chọn file CV (PDF)</strong></p>
                <p class="muted" style="font-size:13px;margin-bottom:12px">Hỗ trợ file PDF có lớp văn bản, tối đa 5 MB</p>
                <div id="selectedFileName" class="tag" style="background:#e0e7ff;color:#3730a3;display:none;font-size:14px;padding:6px 14px"></div>
            </div>

            <!-- Khu vực thông báo lỗi -->
            <div id="errorAlert" class="message" style="display:none;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;margin-top:16px;border-radius:10px;padding:12px 16px">
                <div class="row between">
                    <div class="row" style="gap:8px">
                        <strong style="font-size:16px">⚠ Lỗi:</strong>
                        <span id="errorMessageText"></span>
                    </div>
                    <button type="button" id="closeErrorBtn" style="background:transparent;border:0;color:#991b1b;font-weight:bold;cursor:pointer">✕</button>
                </div>
            </div>

            <!-- Nút Phân tích CV -->
            <div class="row between" style="margin-top:16px">
                <span class="muted" style="font-size:13px">Hệ thống CareerAI sử dụng mô hình Gemini để phân tích nội dung.</span>
                <button type="submit" id="analyzeBtn" class="button button-primary" style="padding:11px 24px;font-size:15px">
                    ⚡ Phân tích CV
                </button>
            </div>
        </form>
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
            <!-- Điểm mạnh -->
            <div class="card" style="background:#f0fdf4;border:1px solid #bbf7d0">
                <h3 style="color:#166534;font-size:16px;display:flex;align-items:center;gap:6px;margin-bottom:12px">
                    <span style="font-size:18px">✔</span> Điểm mạnh nổi bật
                </h3>
                <ul id="strengthsList" style="padding-left:18px;margin:0;color:#14532d;line-height:1.6"></ul>
            </div>

            <!-- Điểm cần cải thiện -->
            <div class="card" style="background:#fff7ed;border:1px solid #fed7aa">
                <h3 style="color:#9a3412;font-size:16px;display:flex;align-items:center;gap:6px;margin-bottom:12px">
                    <span style="font-size:18px">⚠</span> Điểm cần cải thiện
                </h3>
                <ul id="weaknessesList" style="padding-left:18px;margin:0;color:#7c2d12;line-height:1.6"></ul>
            </div>

            <!-- Đề xuất & Gợi ý -->
            <div class="card" style="background:#eff6ff;border:1px solid #bfdbfe">
                <h3 style="color:#1e40af;font-size:16px;display:flex;align-items:center;gap:6px;margin-bottom:12px">
                    <span style="font-size:18px">💡</span> Gợi ý phát triển
                </h3>
                <ul id="suggestionsList" style="padding-left:18px;margin:0;color:#1e3a8a;line-height:1.6"></ul>
            </div>
        </div>

        <!-- Từ khóa kỹ năng còn thiếu (nếu có) -->
        <div id="missingKeywordsCard" class="card" style="display:none;background:#fefce8;border:1px solid #fef08a">
            <h4 style="margin-bottom:8px;color:#854d0e;font-size:14px">Từ khóa chuyên môn nên bổ sung vào CV:</h4>
            <div id="missingKeywordsList"></div>
        </div>

        <p class="muted" style="font-size:12px;text-align:right">
            * Điểm số và đánh giá do AI phân tích tự động dựa trên văn bản trích xuất từ CV, mang tính chất định hướng và tham khảo.
        </p>
    </div>

    <!-- Lịch sử phân tích gần đây -->
    <div id="historySection" style="margin-top:32px">
        <h3 style="font-size:16px;margin-bottom:12px">Lịch sử phân tích gần đây</h3>
        <div id="historyList" class="stack"></div>
    </div>
`);

// Thêm animation quay loading
if (!document.getElementById("spinnerStyle")) {
    const style = document.createElement("style");
    style.id = "spinnerStyle";
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Xử lý kéo thả và chọn file
const dropArea = document.querySelector("#dropArea");
const fileInput = document.querySelector("#cvFileInput");
const selectedFileName = document.querySelector("#selectedFileName");
const errorAlert = document.querySelector("#errorAlert");
const errorMessageText = document.querySelector("#errorMessageText");
const closeErrorBtn = document.querySelector("#closeErrorBtn");

function showError(msg) {
    errorMessageText.textContent = msg;
    errorAlert.style.display = "block";
    errorAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideError() {
    errorAlert.style.display = "none";
    errorMessageText.textContent = "";
}

closeErrorBtn.onclick = hideError;

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

// Xử lý kéo thả (drag & drop)
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
            scoreLabel.style.background = "#dbeafe";
            scoreLabel.style.color = "#1d4ed8";
        } else if (score >= 50) {
            scoreLabel.textContent = "Trung bình";
            scoreLabel.style.background = "#fef3c7";
            scoreLabel.style.color = "#b45309";
        } else {
            scoreLabel.textContent = "Cần cải thiện";
            scoreLabel.style.background = "#fee2e2";
            scoreLabel.style.color = "#b91c1c";
        }
    } else {
        scoreLabel.textContent = "Chưa chấm điểm";
    }

    // Điểm mạnh
    strengthsList.innerHTML = (r.strengths && r.strengths.length)
        ? r.strengths.map(s => `<li style="margin-bottom:6px">${escapeHtml(s)}</li>`).join("")
        : `<li class="muted">Chưa ghi nhận điểm mạnh cụ thể.</li>`;

    // Điểm cần cải thiện
    weaknessesList.innerHTML = (r.weaknesses && r.weaknesses.length)
        ? r.weaknesses.map(w => `<li style="margin-bottom:6px">${escapeHtml(w)}</li>`).join("")
        : `<li class="muted">Không có thiếu sót lớn nào.</li>`;

    // Đề xuất & gợi ý
    suggestionsList.innerHTML = (r.suggestions && r.suggestions.length)
        ? r.suggestions.map(g => `<li style="margin-bottom:6px">${escapeHtml(g)}</li>`).join("")
        : `<li class="muted">Chưa có đề xuất cụ thể.</li>`;

    // Vị trí phù hợp
    if (r.recommendedRoles && r.recommendedRoles.length) {
        rolesList.innerHTML = r.recommendedRoles.map(role => `
            <span class="tag" style="background:#eef2f6;color:#1e293b;font-size:12px;margin:2px 4px">
                💼 ${escapeHtml(role)}
            </span>
        `).join("");
        rolesWrap.style.display = "block";
    } else {
        rolesWrap.style.display = "none";
    }

    // Từ khóa còn thiếu
    if (r.missingKeywords && r.missingKeywords.length) {
        keywordsList.innerHTML = r.missingKeywords.map(kw => `
            <span class="tag" style="background:#fef08a;color:#713f12;font-size:12px;margin:3px">
                + ${escapeHtml(kw)}
            </span>
        `).join("");
        keywordsCard.style.display = "block";
    } else {
        keywordsCard.style.display = "none";
    }

    resultBox.style.display = "grid";
    resultBox.scrollIntoView({ behavior: "smooth" });
}

// Xử lý submit phân tích
const form = document.querySelector("#analysisForm");
const analyzeBtn = document.querySelector("#analyzeBtn");
const processingState = document.querySelector("#processingState");
const processingStep = document.querySelector("#processingStep");

form.onsubmit = async e => {
    e.preventDefault();
    hideError();

    if (!fileInput.files || !fileInput.files.length) {
        showError("Vui lòng chọn hoặc kéo thả file CV dạng PDF.");
        return;
    }

    const file = fileInput.files[0];
    if (file.size > 5 * 1024 * 1024) {
        showError("File vượt quá kích thước 5 MB cho phép.");
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
        analyzeBtn.textContent = "⚡ Phân tích CV";
        processingState.style.display = "none";
    }
};

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
