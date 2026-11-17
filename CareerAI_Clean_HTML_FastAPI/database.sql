-- ==============================================================================
-- DỰ ÁN: CareerAI – Hệ thống Phân tích CV & Hướng nghiệp thông minh bằng AI
-- CƠ SỞ DỮ LIỆU: MySQL (career_ai_db)
-- Bao gồm: Cấu trúc 13 bảng quan hệ + Toàn bộ dữ liệu mẫu (Sample Data)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS career_ai_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE career_ai_db;

-- ==============================================================================
-- PHẦN 1: CẤU TRÚC 13 BẢNG DỮ LIỆU (DDL)
-- ==============================================================================

-- 1. Bảng ROLES (Vai trò người dùng)
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Bảng USERS (Tài khoản người dùng)
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    full_name VARCHAR(120) NULL,
    name VARCHAR(120) NULL,
    password VARCHAR(255) NULL,
    role VARCHAR(50) DEFAULT 'CANDIDATE',
    phone VARCHAR(30) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng phân quyền n-n USER - ROLE
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- 3. Bảng CANDIDATE_PROFILES (Hồ sơ ứng viên: Quan hệ 1-1 với Users)
CREATE TABLE IF NOT EXISTS candidate_profiles (
    profile_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    school VARCHAR(180) NULL,
    major VARCHAR(120) NULL,
    location VARCHAR(120) NULL,
    career_goal TEXT NULL,
    CONSTRAINT fk_candidate_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Bảng COMPANIES (Thông tin doanh nghiệp tuyển dụng)
CREATE TABLE IF NOT EXISTS companies (
    company_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    description TEXT NULL,
    website VARCHAR(500) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng JOBS (Tin đăng tuyển dụng)
CREATE TABLE IF NOT EXISTS jobs (
    job_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    description LONGTEXT NOT NULL,
    deadline DATE NULL,
    company_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE RESTRICT,
    CONSTRAINT fk_jobs_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 6. Bảng RESUMES_CV (File CV ứng viên tải lên)
CREATE TABLE IF NOT EXISTS resumes_cv (
    cv_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    extracted_text LONGTEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7. Bảng CV_ANALYSES (Kết quả phân tích từ Gemini AI)
CREATE TABLE IF NOT EXISTS cv_analyses (
    analysis_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cv_id BIGINT NULL,
    user_id BIGINT NULL,
    file_name VARCHAR(255) NULL,
    score DECIMAL(5,2) NULL,
    result_json LONGTEXT NULL,
    summary TEXT NULL,
    strengths_json JSON NULL,
    improvements_json JSON NULL,
    suggestions_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bảng APPLICATIONS (Hồ sơ ứng tuyển vào vị trí việc làm)
CREATE TABLE IF NOT EXISTS applications (
    application_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    cv_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    CONSTRAINT fk_app_cv FOREIGN KEY (cv_id) REFERENCES resumes_cv(cv_id) ON DELETE RESTRICT,
    CONSTRAINT uq_user_job_application UNIQUE (user_id, job_id)
);

-- 9. Bảng SAVED_JOBS (Việc làm đã lưu)
CREATE TABLE IF NOT EXISTS saved_jobs (
    saved_job_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_job FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_saved_job UNIQUE (user_id, job_id)
);

-- 10. Bảng JOB_REPORTS (Báo cáo tin tuyển dụng vi phạm)
CREATE TABLE IF NOT EXISTS job_reports (
    report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    reporter_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_job FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    CONSTRAINT fk_report_user FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 11. Bảng NOTIFICATIONS (Thông báo hệ thống)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 12. Bảng SUPPORT_REQUESTS (Yêu cầu hỗ trợ)
CREATE TABLE IF NOT EXISTS support_requests (
    support_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_support_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- ==============================================================================
-- PHẦN 2: DỮ LIỆU MẪU ĐẦY ĐỦ (SAMPLE DATA - INSERT STATEMENTS)
-- ==============================================================================

-- 1. Dữ liệu bảng ROLES
INSERT IGNORE INTO roles (role_id, name) VALUES 
(1, 'ROLE_CANDIDATE'), 
(2, 'ROLE_RECRUITER'), 
(3, 'ROLE_ADMIN');

-- 2. Dữ liệu bảng USERS (Mật khẩu mặc định đều là 123456@)
INSERT IGNORE INTO users (user_id, email, password_hash, password, full_name, name, phone, role, is_active) VALUES 
(1, 'accthanhtai@gmail.com', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', 'Thanh Tai', 'Thanh Tai', '0900000001', 'ADMIN', 1),
(2, 'tuanhuynh1122007@gmail.com', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', 'Huỳnh Anh Tuấn', 'Huỳnh Anh Tuấn', '0900000002', 'CANDIDATE', 1),
(3, 'nguyenvanan@gmail.com', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', 'Nguyễn Văn An', 'Nguyễn Văn An', '0901234567', 'CANDIDATE', 1),
(4, 'tranthibinh@gmail.com', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', 'Trần Thị Bình', 'Trần Thị Bình', '0912345678', 'CANDIDATE', 1),
(5, 'lehoangnam@gmail.com', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', 'Lê Hoàng Nam', 'Lê Hoàng Nam', '0923456789', 'CANDIDATE', 1),
(6, 'recruiter.fpt@fpt.com', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', 'HR FPT Software', 'HR FPT Software', '0934567890', 'RECRUITER', 1),
(7, 'hr.viettel@viettel.vn', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', '$2a$10$Gs1KdMKZow4rDmV3owZqFOI0sXR2P/GDsgBErUg6EQa0Ny9oycL0e', 'Talent Viettel', 'Talent Viettel', '0945678901', 'RECRUITER', 1);

-- Bảng phân quyền USER_ROLES
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES 
(1, 3), -- Admin
(2, 1), -- Candidate (Huỳnh Anh Tuấn)
(3, 1), -- Candidate (Nguyễn Văn An)
(4, 1), -- Candidate (Trần Thị Bình)
(5, 1), -- Candidate (Lê Hoàng Nam)
(6, 2), -- Recruiter (FPT)
(7, 2); -- Recruiter (Viettel)

-- 3. Dữ liệu bảng CANDIDATE_PROFILES (Hồ sơ ứng viên: Trường, ngành, mục tiêu)
INSERT INTO candidate_profiles (profile_id, user_id, school, major, location, career_goal) VALUES 
(1, 2, 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)', 'Kỹ thuật Phần mềm', 'TP. Hồ Chí Minh', 'Mục tiêu trở thành Senior Fullstack Developer trong 3 năm tới, đóng góp vào các hệ thống triệu người dùng.'),
(2, 3, 'Đại học Bách Khoa TP.HCM', 'Khoa học Máy tính', 'TP. Hồ Chí Minh', 'Mong muốn phát triển chuyên sâu về AI/Data Engineer, ứng dụng LLM vào tự động hóa doanh nghiệp.'),
(3, 4, 'Đại học Công Nghệ Thông Tin - ĐHQG', 'Hệ thống Thông tin', 'TP. Hồ Chí Minh', 'Tìm kiếm cơ hội thực tập và làm việc vị trí Frontend ReactJS/TypeScript tại các công ty công nghệ năng động.'),
(4, 5, 'Đại học Sư phạm Kỹ thuật TP.HCM', 'Mạng máy tính & An toàn thông tin', 'TP. Hồ Chí Minh', 'Định hướng phát triển chuyên môn Backend Node.js, thiết kế hệ thống Microservices chịu tải cao.')
ON DUPLICATE KEY UPDATE 
    school = VALUES(school),
    major = VALUES(major),
    location = VALUES(location),
    career_goal = VALUES(career_goal);

-- 4. Dữ liệu bảng COMPANIES (Doanh nghiệp công nghệ)
INSERT IGNORE INTO companies (company_id, name, description, website) VALUES 
(1, 'FPT Software', 'Tập đoàn công nghệ và chuyển đổi số hàng đầu Đông Nam Á, môi trường quốc tế chuyên nghiệp.', 'https://fptsoftware.com'),
(2, 'Viettel Telecom', 'Tập đoàn Viễn thông và Công nghệ Thông tin hàng đầu Việt Nam, tiên phong hạ tầng 5G và Cloud.', 'https://viettel.vn'),
(3, 'VNG Corporation', 'Kỳ lân công nghệ đầu tiên tại Việt Nam, sở hữu Zalo, ZaloPay và hệ sinh thái giải trí số.', 'https://vng.com.vn'),
(4, 'VinAI Research', 'Viện nghiên cứu trí tuệ nhân tạo hàng đầu thế giới thuộc Vingroup, phát triển Generative AI.', 'https://vinai.io'),
(5, 'Techcombank Digital', 'Ngân hàng số dẫn đầu giải pháp thanh toán và trải nghiệm khách hàng tại Việt Nam.', 'https://techcombank.com.vn');

-- 5. Dữ liệu bảng JOBS (Tin tuyển dụng)
INSERT IGNORE INTO jobs (job_id, title, description, deadline, company_id, created_by) VALUES 
(1, 'Lập trình viên Frontend (ReactJS / TypeScript)', 'Xây dựng các sản phẩm Web Single Page Application hiện đại với React, Vite, Redux Toolkit và TailwindCSS. Yêu cầu tối thiểu 1 năm kinh nghiệm hoặc sinh viên giỏi mới tốt nghiệp.', '2026-12-31', 1, 6),
(2, 'Lập trình viên Backend (Node.js / Express / MySQL)', 'Thiết kế RESTful API, tối ưu hóa cơ sở dữ liệu MySQL, xây dựng kiến trúc Microservices và bảo mật JWT. Hưởng mức lương cạnh tranh và cơ hội đào tạo chuyên sâu.', '2026-12-15', 2, 7),
(3, 'Kỹ sư Trí tuệ Nhân tạo (AI Engineer / NLP)', 'Nghiên cứu và ứng dụng các mô hình ngôn ngữ lớn (LLM, Gemini, OpenAI), xây dựng giải pháp RAG và tích hợp AI Agent vào sản phẩm thực tế.', '2026-12-20', 4, 6),
(4, 'Kỹ sư DevOps & Cloud (Docker / Kubernetes)', 'Triển khai hệ thống CI/CD với GitHub Actions, vận hành hạ tầng Container trên Kubernetes và giám sát hiệu năng với Prometheus, Grafana.', '2026-12-25', 3, 7),
(5, 'Thực tập sinh Lập trình Web Fullstack (Paid Internship)', 'Dành cho sinh viên năm 3, năm 4 khối ngành CNTT. Được mentor 1-1, tham gia trực tiếp dự án thực tế, có trợ cấp thực tập hấp dẫn và cơ hội lên chính thức.', '2026-11-30', 5, 6);

-- 6. Dữ liệu bảng RESUMES_CV (File CV mẫu)
INSERT IGNORE INTO resumes_cv (cv_id, user_id, file_name, storage_path, extracted_text) VALUES 
(1, 2, 'CV_Frontend_Developer.pdf', '/uploads/cv/CV_Frontend_Developer.pdf', 'Huỳnh Anh Tuấn - Frontend Developer. Kỹ năng: ReactJS, JavaScript ES6+, HTML5/CSS3, Git, RESTful API. Đã hoàn thành đồ án CareerAI điểm xuất sắc.'),
(2, 2, 'CV_Fullstack_NodeJS_React.pdf', '/uploads/cv/CV_Fullstack_NodeJS_React.pdf', 'Huỳnh Anh Tuấn - Fullstack Engineer. Kỹ năng: Node.js, Express, ReactJS, MySQL, Docker, JWT. Tốt nghiệp loại giỏi ngành CNTT.');

-- 7. Dữ liệu bảng CV_ANALYSES (Kết quả chấm điểm và đánh giá từ AI)
INSERT IGNORE INTO cv_analyses (analysis_id, cv_id, user_id, file_name, score, summary, strengths_json, improvements_json, suggestions_json, result_json) VALUES 
(1, 1, 2, 'CV_Frontend_Developer.pdf', 88.50, 
 'CV trình bày rõ ràng, kỹ năng ReactJS và tư duy UI/UX rất tốt. Phù hợp các vị trí Frontend Junior/Mid-level.',
 '["Nắm chắc kiến trúc React Component và Hooks", "Có kinh nghiệm tích hợp RESTful API thực tế", "Trình bày cấu trúc CV mạch lạc, chuyên nghiệp"]',
 '["Cần bổ sung thêm các dự án có triển khai TypeScript", "Thêm chứng chỉ tiếng Anh (TOEIC/IELTS) nếu có"]',
 '["Học thêm Redux Toolkit hoặc Zustand để quản lý State lớn", "Đưa link GitHub và demo các dự án lên đầu CV"]',
 '{"score": 88.5, "summary": "CV trình bày rõ ràng, kỹ năng ReactJS và tư duy UI/UX rất tốt.", "strengths": ["Nắm chắc kiến trúc React Component và Hooks", "Có kinh nghiệm tích hợp RESTful API thực tế"], "weaknesses": ["Cần bổ sung thêm các dự án có triển khai TypeScript"], "missingKeywords": ["Docker", "TypeScript", "Jest"], "suggestions": ["Học thêm Redux Toolkit hoặc Zustand"], "recommendedRoles": ["ReactJS Developer", "Frontend Engineer"]}'),
(2, 2, 2, 'CV_Fullstack_NodeJS_React.pdf', 92.00, 
 'Ứng viên có nền tảng vững vàng cả Frontend lẫn Backend, kỹ năng cơ sở dữ liệu MySQL và bảo mật tốt.',
 '["Hiểu sâu kiến trúc Express và MySQL Indexing", "Có kinh nghiệm kết nối Gemini AI API", "Kỹ năng làm việc nhóm Agile/Scrum tốt"]',
 '["Nên bổ sung Unit Testing (Jest, Mocha)", "Tìm hiểu thêm Docker và triển khai Cloud"]',
 '["Tối ưu thêm phần giải thích các bài toán khó đã giải quyết trong đồ án"]',
 '{"score": 92.0, "summary": "Ứng viên có nền tảng vững vàng cả Frontend lẫn Backend.", "strengths": ["Hiểu sâu kiến trúc Express và MySQL Indexing", "Có kinh nghiệm kết nối Gemini AI API"], "weaknesses": ["Nên bổ sung Unit Testing (Jest, Mocha)"], "missingKeywords": ["Docker", "CI/CD", "AWS"], "suggestions": ["Tối ưu thêm phần giải thích bài toán khó"], "recommendedRoles": ["Fullstack Developer", "Node.js Backend Engineer"]}');

-- 8. Dữ liệu bảng APPLICATIONS (Đơn ứng tuyển)
INSERT IGNORE INTO applications (application_id, user_id, job_id, cv_id, status) VALUES 
(1, 2, 1, 1, 'REVIEWING'),
(2, 2, 2, 2, 'SUBMITTED');

-- 9. Dữ liệu bảng SAVED_JOBS (Việc làm đã lưu)
INSERT IGNORE INTO saved_jobs (saved_job_id, user_id, job_id) VALUES 
(1, 2, 3),
(2, 2, 4);

-- 10. Dữ liệu bảng JOB_REPORTS (Báo cáo vi phạm)
INSERT IGNORE INTO job_reports (report_id, job_id, reporter_id, reason) VALUES 
(1, 1, 2, 'Tin tuyển dụng đã hết hạn nhưng vẫn còn hiển thị.');

-- 11. Dữ liệu bảng NOTIFICATIONS (Thông báo hệ thống)
INSERT IGNORE INTO notifications (notification_id, user_id, title, message, is_read) VALUES 
(1, 2, 'Chào mừng đến với CareerAI', 'Hệ thống đã sẵn sàng hỗ trợ bạn phân tích CV và tìm kiếm việc làm phù hợp.', 1),
(2, 2, 'Kết quả phân tích CV', 'CV của bạn vừa được Gemini AI phân tích đạt 88.5/100 điểm. Hãy kiểm tra các đề xuất cải thiện!', 0),
(3, 2, 'Cơ hội việc làm mới', 'FPT Software vừa đăng tin tuyển dụng Lập trình viên Frontend phù hợp với hồ sơ của bạn.', 0);

-- 12. Dữ liệu bảng SUPPORT_REQUESTS (Yêu cầu hỗ trợ)
INSERT IGNORE INTO support_requests (support_id, user_id, subject, content) VALUES 
(1, 2, 'Hỗ trợ tải CV định dạng PDF', 'Hệ thống phân tích rất nhanh và chính xác. Cảm ơn đội ngũ phát triển CareerAI!');
