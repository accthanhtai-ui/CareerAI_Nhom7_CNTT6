import { api, getToken } from "../common/api.js";
import { setPage, escapeHtml, toast } from "../common/ui.js";

const root = setPage("Quản lý CV", "Tải lên, xem trước, tải xuống và quản lý các CV PDF của bạn.");

root.insertAdjacentHTML("beforeend", `
    <div class="card">
        <form id="uploadForm" class="upload-area">
            <p><strong>Chọn CV định dạng PDF (tối đa 5 MB)</strong></p>
            <p class="muted" style="margin-bottom:12px;font-size:13px">Hệ thống sẽ tự động trích xuất nội dung văn bản để phân tích và gợi ý việc làm phù hợp.</p>
            <input type="file" name="cv" accept="application/pdf" required style="max-width:360px;margin-bottom:12px">
            <br>
            <button class="button button-primary" type="submit">Tải CV lên</button>
        </form>
    </div>

    <div class="row between" style="margin-top:24px;margin-bottom:8px">
        <h2 style="font-size:18px;margin:0">Danh sách CV của bạn</h2>
        <span id="cvCount" class="muted" style="font-size:14px"></span>
    </div>

    <div id="cvList" class="stack"></div>

    <div id="previewModal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.65);z-index:9999;align-items:center;justify-content:center;padding:20px">
        <div style="background:#fff;border-radius:14px;max-width:900px;width:100%;height:85vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25)">
            <div class="row between" style="padding:16px 20px;border-bottom:1px solid var(--line);background:#f8fafc">
                <div>
                    <strong id="previewTitle" style="font-size:16px">Xem trước CV</strong>
                    <span class="tag" style="background:#e6f9f0;color:#0e7041;margin-left:8px">Đã xử lý</span>
                </div>
                <div class="actions">
                    <button id="closePreviewBtn" class="button button-light" style="padding:6px 14px">Đóng</button>
                </div>
            </div>
            <div style="flex:1;position:relative;background:#525659">
                <iframe id="previewFrame" style="width:100%;height:100%;border:0" title="PDF Preview"></iframe>
            </div>
        </div>
    </div>
`);

const DEFAULT_CV_KEY = "career_ai_default_cv_id";

function getDefaultCvId() {
    return localStorage.getItem(DEFAULT_CV_KEY);
}

function setDefaultCvId(id) {
    localStorage.setItem(DEFAULT_CV_KEY, String(id));
}

let activeBlobUrl = null;

async function fetchPdfBlob(cvId) {
    const response = await fetch(`/api/cvs/${cvId}/download`, {
        headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Không thể tải nội dung file CV.");
    return await response.blob();
}

async function previewCv(cvId, fileName) {
    try {
        toast("Đang tải bản xem trước...");
        const blob = await fetchPdfBlob(cvId);
        if (activeBlobUrl) {
            URL.revokeObjectURL(activeBlobUrl);
        }
        activeBlobUrl = URL.createObjectURL(blob);

        const modal = document.querySelector("#previewModal");
        const frame = document.querySelector("#previewFrame");
        const title = document.querySelector("#previewTitle");

        title.textContent = `Xem trước: ${fileName}`;
        frame.src = activeBlobUrl;
        modal.style.display = "flex";
    } catch (err) {
        toast(err.message || "Lỗi xem trước CV.");
    }
}

function closePreview() {
    const modal = document.querySelector("#previewModal");
    const frame = document.querySelector("#previewFrame");
    modal.style.display = "none";
    frame.src = "about:blank";
    if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
        activeBlobUrl = null;
    }
}

document.querySelector("#closePreviewBtn").onclick = closePreview;
document.querySelector("#previewModal").onclick = (e) => {
    if (e.target.id === "previewModal") closePreview();
};

async function load() {
    const cvs = await api("/cvs");
    const list = document.querySelector("#cvList");
    const countEl = document.querySelector("#cvCount");

    countEl.textContent = `Tổng cộng: ${cvs.length} CV`;

    let defaultCvId = getDefaultCvId();
    if (cvs.length && (!defaultCvId || !cvs.some(c => String(c.cv_id) === String(defaultCvId)))) {
        defaultCvId = String(cvs[0].cv_id);
        setDefaultCvId(defaultCvId);
    }

    list.innerHTML = cvs.length
        ? cvs.map(c => {
            const isDefault = String(c.cv_id) === String(defaultCvId);
            const statusLabel = (c.text_length && c.text_length > 0)
                ? `<span class="tag" style="background:#e6f9f0;color:#0e7041">Đã xử lý (Sẵn sàng)</span>`
                : `<span class="tag" style="background:#fef3c7;color:#92400e">Đang xử lý</span>`;

            const defaultBadge = isDefault
                ? `<span class="tag" style="background:#dbeafe;color:#1e40af;font-weight:600">★ CV Mặc định</span>`
                : "";

            return `
            <article class="list-item row between" style="${isDefault ? 'border-color:#93c5fd;background:#fbfdff' : ''}">
                <div style="flex:1;min-width:240px">
                    <div class="row" style="margin-bottom:6px">
                        <strong style="font-size:15px">${escapeHtml(c.file_name)}</strong>
                        ${defaultBadge}
                        ${statusLabel}
                    </div>
                    <p class="muted" style="font-size:13px;margin:0">
                        Ngày tải: ${new Date(c.created_at).toLocaleString("vi-VN")}
                        ${c.text_length ? `• Đã trích xuất ${c.text_length} ký tự văn bản` : ""}
                    </p>
                </div>
                <div class="actions">
                    <button class="button button-light"
                        data-preview="${c.cv_id}"
                        data-name="${escapeHtml(c.file_name)}">
                        👁 Xem trước
                    </button>
                    <button class="button button-light"
                        data-download="${c.cv_id}"
                        data-name="${escapeHtml(c.file_name)}">
                        ⬇ Tải xuống
                    </button>
                    ${!isDefault ? `
                        <button class="button button-light" data-set-default="${c.cv_id}">
                            ★ Đặt làm mặc định
                        </button>
                    ` : ""}
                    <button class="button button-light" data-delete="${c.cv_id}" style="color:#b91c1c">
                        ✕ Xóa
                    </button>
                </div>
            </article>
        `;
        }).join("")
        : `<div class="card empty">Bạn chưa tải CV nào lên. Hãy chọn file PDF ở trên để bắt đầu!</div>`;

    // Gán sự kiện xem trước
    list.querySelectorAll("[data-preview]").forEach(b => {
        b.onclick = () => previewCv(b.dataset.preview, b.dataset.name);
    });

    // Gán sự kiện tải xuống
    list.querySelectorAll("[data-download]").forEach(b => {
        b.onclick = async () => {
            try {
                const blob = await fetchPdfBlob(b.dataset.download);
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = b.dataset.name;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
                toast("Đã tải CV về máy.");
            } catch (error) {
                toast(error.message);
            }
        };
    });

    // Gán sự kiện đặt làm mặc định
    list.querySelectorAll("[data-set-default]").forEach(b => {
        b.onclick = async () => {
            setDefaultCvId(b.dataset.setDefault);
            toast("Đã đặt làm CV mặc định.");
            await load();
        };
    });

    // Gán sự kiện xóa CV
    list.querySelectorAll("[data-delete]").forEach(b => {
        b.onclick = async () => {
            if (!confirm("Bạn có chắc chắn muốn xóa CV này?")) return;
            try {
                await api(`/cvs/${b.dataset.delete}`, { method: "DELETE" });
                toast("Đã xóa CV.");
                if (String(getDefaultCvId()) === String(b.dataset.delete)) {
                    localStorage.removeItem(DEFAULT_CV_KEY);
                }
                await load();
            } catch (error) {
                toast(error.message);
            }
        };
    });
}

// Xử lý upload CV
const uploadForm = document.querySelector("#uploadForm");

uploadForm.onsubmit = async e => {
    e.preventDefault();

    const form = e.currentTarget;
    const button = form.querySelector("button");

    try {
        button.disabled = true;
        button.textContent = "Đang tải lên và xử lý...";

        const result = await api("/cvs", {
            method: "POST",
            body: new FormData(form)
        });

        toast("Tải CV và trích xuất thành công!");

        if (result && result.cv_id && !getDefaultCvId()) {
            setDefaultCvId(result.cv_id);
        }

        form.reset();
        await load();

    } catch (error) {
        toast(error.message);
    } finally {
        button.disabled = false;
        button.textContent = "Tải CV lên";
    }
};

load().catch(error => toast(error.message));
