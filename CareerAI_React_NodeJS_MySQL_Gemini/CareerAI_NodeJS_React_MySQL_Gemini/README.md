# CareerAI – ReactJS + Node.js + Express + MySQL + Gemini

Dự án KHÔNG sử dụng Java, Spring Boot hoặc file `.java`.

## Công nghệ
- Frontend: ReactJS, JSX, CSS, Vite
- Backend: Node.js, Express.js
- Database: MySQL
- AI: Gemini API qua Backend Node.js

## A. Cài đặt MySQL
1. Mở MySQL Workbench, kết nối MySQL local.
2. Mở file `backend/database/schema.sql`.
3. Bấm tia sét (Execute) để chạy toàn bộ script. Database `careerai_db`, bảng `users`, `cv_analyses` sẽ được tạo.

## B. Cấu hình Backend
1. Mở terminal tại thư mục `backend`.
2. Chạy `npm install`.
3. Copy `.env.example` thành `.env`.
4. Sửa DB_USER, DB_PASSWORD theo MySQL của bạn.
5. Tạo Gemini API Key tại https://aistudio.google.com/apikey rồi dán vào `GEMINI_API_KEY=` trong `backend/.env`.
6. Đảm bảo `JWT_SECRET` là chuỗi bí mật riêng của bạn.
7. Chạy `npm run dev`.

Backend chạy tại `http://localhost:5000`. Kiểm tra `http://localhost:5000/api/health`.

## C. Chạy Frontend
Mở terminal mới ở thư mục gốc có `package.json`:
```bash
npm install
npm run dev
```
Mở URL Vite hiện ra, thường là `http://localhost:5173`.

## D. Tài khoản Admin thử nghiệm
- Email: `accthanhtai@gmail.com`
- Mật khẩu: `123456@`

Backend tự tạo Admin ở lần khởi động đầu tiên nếu email chưa tồn tại. Mật khẩu được mã hóa BCrypt, không lưu dạng chữ thường. Tài khoản này có quyền xem trang `/admin`.

## E. Dùng thử AI
- Đăng nhập → Phân tích CV → chọn PDF → Phân tích CV.
- Đăng nhập → Trò chuyện với AI → hỏi nội dung bất kỳ.
- API Key Gemini chỉ nằm trong `backend/.env`, tuyệt đối không đặt trong frontend `.env` hoặc biến `VITE_`.

## Lưu ý
- Phân tích PDF yêu cầu PDF có lớp văn bản; PDF scan dạng ảnh cần OCR (chưa tích hợp).
- Điểm CV là đánh giá tham khảo từ AI, không đảm bảo kết quả tuyển dụng.
- Lịch sử phân tích lưu trong MySQL. Chat hiện giữ trong trạng thái giao diện, chưa lưu lịch sử chat vào DB.
- Admin mẫu chỉ dùng local/demo; hãy đổi mật khẩu và JWT_SECRET trước khi triển khai công khai.
