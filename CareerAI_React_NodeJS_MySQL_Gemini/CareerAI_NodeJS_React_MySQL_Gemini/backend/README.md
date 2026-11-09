# Backend CareerAI (Node.js + Express)

Không sử dụng Java/Spring Boot.

## 1. Cài đặt
Mở terminal trong thư mục `backend`:
```bash
npm install
```
Sao chép `.env.example` thành `.env`, sau đó chỉnh thông tin MySQL và Gemini API Key.

## 2. Kết nối MySQL
Mở MySQL Workbench, chạy toàn bộ file `database/schema.sql` (tạo database `careerai_db`).
Trong `backend/.env`:
- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_USER=root`
- `DB_PASSWORD=` (điền mật khẩu MySQL của bạn nếu có)
- `DB_NAME=careerai_db`

## 3. Tạo Admin
Backend tự tạo tài khoản Admin nếu email chưa tồn tại:
- Email: `accthanhtai@gmail.com`
- Mật khẩu: `123456@`
- Vai trò: `ADMIN`

Nếu muốn đổi thông tin, sửa `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` trong `.env` trước lần chạy đầu tiên. Mật khẩu được băm BCrypt trước khi lưu. Đừng dùng mật khẩu mẫu này khi triển khai thật.

## 4. Gemini API
Lấy key tại https://aistudio.google.com/apikey và dán vào:
`GEMINI_API_KEY=...` trong `backend/.env`.
Không dán key vào React/Vite và không gửi key cho người khác.

## 5. Chạy Backend
```bash
npm run dev
```
API: http://localhost:5000/api
Health check: http://localhost:5000/api/health
