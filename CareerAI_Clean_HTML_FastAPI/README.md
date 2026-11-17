# CareerAI – HTML, CSS, JavaScript thuần + Python FastAPI + MySQL

## 1. Công nghệ
- Frontend: HTML riêng từng trang, CSS chia theo nhóm, JavaScript ES Module.
- Backend: Python FastAPI, router tách theo nghiệp vụ.
- Database: MySQL, chạy script `database.sql` bằng MySQL Workbench.
- AI: Gemini API gọi từ backend; API key không đưa ra trình duyệt.

## 2. Cấu trúc
```text
CareerAI_Clean_HTML_FastAPI/
├── frontend/
│   ├── index.html
│   ├── pages/                 # Mỗi màn hình một file HTML
│   ├── css/                   # CSS nền, layout, component
│   ├── js/
│   │   ├── common/            # Gọi API và tiện ích giao diện
│   │   └── pages/             # JS riêng từng trang
│   └── assets/
├── backend/
│   ├── main.py                # Khởi tạo FastAPI
│   ├── config.py              # Đọc cấu hình .env
│   ├── database.py            # Kết nối và truy vấn MySQL
│   ├── security.py            # Mật khẩu, JWT, phân quyền
│   ├── routers/               # API theo nghiệp vụ
│   ├── services/              # Tích hợp Gemini
│   └── uploads/               # File CV riêng tư
└── database.sql
```

## 3. Cài đặt
1. Mở MySQL Workbench, chạy toàn bộ `database.sql` để tạo `career_ai_db` và dữ liệu mẫu.
2. Mở Terminal tại thư mục dự án:

```powershell
cd backend
py -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

3. Mở `backend/.env`, nhập mật khẩu MySQL và Gemini API key.
4. Quay lại thư mục gốc rồi chạy:

```powershell
cd ..
py -m uvicorn backend.main:app --reload
```

5. Truy cập `http://127.0.0.1:8000`. Tài liệu API tại `http://127.0.0.1:8000/docs`.

## 4. Tài khoản dữ liệu mẫu
File SQL hiện có tài khoản Admin `accthanhtai@gmail.com`; mật khẩu mẫu trong dữ liệu gốc được ghi là `123456@`. Nếu đăng nhập không thành công do hash BCrypt của dữ liệu mẫu khác môi trường, hãy tạo tài khoản mới qua trang đăng ký và cấp role ADMIN bằng MySQL Workbench:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'email_cua_ban';
```

## 5. Các luồng đã được đưa vào cấu trúc
- Đăng ký, đăng nhập, JWT và kiểm tra role.
- Hồ sơ cá nhân và thống kê dashboard.
- Upload, liệt kê, tải xuống và xóa CV PDF.
- Phân tích CV bằng Gemini, lưu lịch sử phân tích.
- Chatbot tư vấn nghề nghiệp Gemini có lịch sử hội thoại phía trình duyệt.
- Danh sách việc làm, tìm kiếm, sắp xếp, phân trang, xem chi tiết.
- Lưu việc làm, ứng tuyển, theo dõi và rút hồ sơ.
- Thông báo, gửi yêu cầu hỗ trợ.
- Dashboard Admin, danh sách tài khoản và khóa/mở khóa.

## 6. Lưu ý
- Chỉ dùng PDF có lớp văn bản; OCR cho PDF scan chưa được triển khai.
- Quên/đặt lại mật khẩu, quản lý công ty, báo cáo vi phạm và một số nghiệp vụ quản trị mở rộng vẫn cần phát triển tiếp để đạt đủ toàn bộ FR-01 đến FR-35 của SRS 1.1.
- Trước khi triển khai Internet cần giới hạn CORS, bật HTTPS, bảo vệ file CV, đặt JWT_SECRET mạnh và không commit `.env`.
