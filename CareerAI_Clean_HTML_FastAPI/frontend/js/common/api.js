const API_BASE = "/api";

export function getToken() {
  return localStorage.getItem("careerai_token");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("careerai_user") || "null");
  } catch {
    return null;
  }
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(API_BASE + path, { ...options, headers });
  } catch (networkError) {
    throw new Error(
      "Không thể kết nối đến máy chủ backend (FastAPI). Vui lòng kiểm tra lại dịch vụ đang chạy hoặc kết nối mạng.",
    );
  }

  // Tự động xử lý khi hết hạn phiên đăng nhập (401)
  if (response.status === 401) {
    const publicPages = ["login", "register", "index"];
    const currentPage = document.body?.dataset?.page || "";
    if (!publicPages.includes(currentPage)) {
      localStorage.removeItem("careerai_token");
      localStorage.removeItem("careerai_user");
      location.href = "/pages/login.html?expired=1";
      return;
    }
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: "Máy chủ trả về phản hồi không hợp lệ." };
  }

  if (!response.ok) {
    let errMsg =
      data.detail || data.message || "Có lỗi xảy ra khi xử lý yêu cầu.";
    if (Array.isArray(errMsg)) {
      errMsg = errMsg.map((e) => e.msg || JSON.stringify(e)).join("; ");
    }
    const text = typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg);
    if (text.includes("Failed to fetch") || text.includes("NetworkError")) {
      throw new Error(
        "Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra lại dịch vụ đang chạy.",
      );
    }
    throw new Error(text);
  }

  return data;
}

export function json(method, data) {
  return { method, body: JSON.stringify(data) };
}
