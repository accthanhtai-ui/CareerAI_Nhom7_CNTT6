import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function seed() {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "career_ai_db",
    multipleStatements: true
  });

  console.log("Connected to career_ai_db for seeding...");

  const hash = await bcrypt.hash("123456@", 10);

  // 1. Roles & User Roles for existing users (id: 1 Admin, id: 2 Candidate)
  await conn.query(`
    INSERT IGNORE INTO roles (role_id, name) VALUES 
    (1, 'ROLE_CANDIDATE'), 
    (2, 'ROLE_RECRUITER'), 
    (3, 'ROLE_ADMIN');
  `);

  await conn.query(`
    INSERT IGNORE INTO user_roles (user_id, role_id) VALUES 
    (1, 3), -- Admin
    (2, 1); -- Candidate (tuanhuynh1122007)
  `);

  // 2. Add extra sample users if not exists
  const sampleUsers = [
    { name: "Nguyễn Văn An", email: "nguyenvanan@gmail.com", phone: "0901234567", role: "CANDIDATE", roleId: 1 },
    { name: "Trần Thị Bình", email: "tranthibinh@gmail.com", phone: "0912345678", role: "CANDIDATE", roleId: 1 },
    { name: "Lê Hoàng Nam", email: "lehoangnam@gmail.com", phone: "0923456789", role: "CANDIDATE", roleId: 1 },
    { name: "HR FPT Software", email: "recruiter.fpt@fpt.com", phone: "0934567890", role: "RECRUITER", roleId: 2 },
    { name: "Talent Viettel", email: "hr.viettel@viettel.vn", phone: "0945678901", role: "RECRUITER", roleId: 2 }
  ];

  for (const u of sampleUsers) {
    const [existing] = await conn.query("SELECT user_id FROM users WHERE email = ?", [u.email]);
    let uid;
    if (existing.length === 0) {
      const [res] = await conn.query(
        "INSERT INTO users (full_name, name, email, password_hash, password, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
        [u.name, u.name, u.email, hash, hash, u.phone, u.role]
      );
      uid = res.insertId;
      console.log(`Created user: ${u.email} (id: ${uid})`);
    } else {
      uid = existing[0].user_id;
    }
    await conn.query("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", [uid, u.roleId]);
  }

  // 3. Candidate profiles for candidates (user 2, and new users)
  const [candidates] = await conn.query("SELECT user_id, full_name FROM users WHERE role = 'CANDIDATE'");
  const schools = ["Đại học Bách Khoa TP.HCM", "Đại học Công Nghệ Thông Tin - ĐHQG", "Học viện Công nghệ Bưu chính Viễn thông (PTIT)", "Đại học Sư phạm Kỹ thuật"];
  const majors = ["Kỹ thuật Phần mềm", "Khoa học Máy tính", "Hệ thống Thông tin", "Mạng máy tính & An toàn thông tin"];
  const goals = [
    "Mục tiêu trở thành Senior Fullstack Developer trong 3 năm tới, đóng góp vào các hệ thống triệu người dùng.",
    "Mong muốn phát triển chuyên sâu về AI/Data Engineer, ứng dụng LLM vào tự động hóa doanh nghiệp.",
    "Tìm kiếm cơ hội thực tập và làm việc vị trí Frontend ReactJS/TypeScript tại các công ty công nghệ năng động.",
    "Định hướng phát triển chuyên môn Backend Node.js, thiết kế hệ thống Microservices chịu tải cao."
  ];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    await conn.query(`
      INSERT INTO candidate_profiles (user_id, school, major, location, career_goal)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        school = VALUES(school),
        major = VALUES(major),
        location = VALUES(location),
        career_goal = VALUES(career_goal);
    `, [
      c.user_id,
      schools[i % schools.length],
      majors[i % majors.length],
      "TP. Hồ Chí Minh",
      goals[i % goals.length]
    ]);
  }
  console.log("Seeded candidate profiles.");

  // 4. Companies
  const companiesData = [
    { name: "FPT Software", desc: "Tập đoàn công nghệ và chuyển đổi số hàng đầu Đông Nam Á, môi trường quốc tế chuyên nghiệp.", website: "https://fptsoftware.com" },
    { name: "Viettel Telecom", desc: "Tập đoàn Viễn thông và Công nghệ Thông tin hàng đầu Việt Nam, tiên phong hạ tầng 5G và Cloud.", website: "https://viettel.vn" },
    { name: "VNG Corporation", desc: "Kỳ lân công nghệ đầu tiên tại Việt Nam, sản phẩm Zalo, ZaloPay và hệ sinh thái giải trí số.", website: "https://vng.com.vn" },
    { name: "VinAI Research", desc: "Viện nghiên cứu trí tuệ nhân tạo hàng đầu thế giới thuộc Vingroup, phát triển Generative AI.", website: "https://vinai.io" },
    { name: "Techcombank Digital", desc: "Ngân hàng số dẫn đầu giải pháp thanh toán và trải nghiệm khách hàng tại Việt Nam.", website: "https://techcombank.com.vn" }
  ];

  const companyIds = [];
  for (const comp of companiesData) {
    const [found] = await conn.query("SELECT company_id FROM companies WHERE name = ?", [comp.name]);
    if (found.length === 0) {
      const [res] = await conn.query(
        "INSERT INTO companies (name, description, website) VALUES (?, ?, ?)",
        [comp.name, comp.desc, comp.website]
      );
      companyIds.push(res.insertId);
    } else {
      companyIds.push(found[0].company_id);
    }
  }
  console.log(`Seeded ${companyIds.length} companies.`);

  // 5. Jobs
  const [recruiters] = await conn.query("SELECT user_id FROM users WHERE role = 'RECRUITER'");
  const creatorId = recruiters.length > 0 ? recruiters[0].user_id : 1;

  const jobsData = [
    {
      title: "Lập trình viên Frontend (ReactJS / TypeScript)",
      company_id: companyIds[0] || 1,
      desc: "Xây dựng các sản phẩm Web Single Page Application hiện đại với React, Vite, Redux Toolkit và TailwindCSS. Yêu cầu tối thiểu 1 năm kinh nghiệm hoặc sinh viên giỏi mới tốt nghiệp.",
      deadline: "2026-12-31"
    },
    {
      title: "Lập trình viên Backend (Node.js / Express / MySQL)",
      company_id: companyIds[1] || 1,
      desc: "Thiết kế RESTful API, tối ưu hóa cơ sở dữ liệu MySQL, xây dựng kiến trúc Microservices và bảo mật JWT. Hưởng mức lương cạnh tranh và cơ hội đào tạo chuyên sâu.",
      deadline: "2026-12-15"
    },
    {
      title: "Kỹ sư Trí tuệ Nhân tạo (AI Engineer / NLP)",
      company_id: companyIds[3] || 1,
      desc: "Nghiên cứu và ứng dụng các mô hình ngôn ngữ lớn (LLM, Gemini, OpenAI), xây dựng giải pháp RAG và tích hợp AI Agent vào sản phẩm thực tế.",
      deadline: "2026-12-20"
    },
    {
      title: "Kỹ sư DevOps & Cloud (Docker / Kubernetes)",
      company_id: companyIds[2] || 1,
      desc: "Triển khai hệ thống CI/CD với GitHub Actions, vận hành hạ tầng Container trên Kubernetes và giám sát hiệu năng với Prometheus, Grafana.",
      deadline: "2026-12-25"
    },
    {
      title: "Thực tập sinh Lập trình Web Fullstack (Paid Internship)",
      company_id: companyIds[4] || 1,
      desc: "Dành cho sinh viên năm 3, năm 4 khối ngành CNTT. Được mentor 1-1, tham gia trực tiếp dự án thực tế, có trợ cấp thực tập hấp dẫn và cơ hội lên chính thức.",
      deadline: "2026-11-30"
    }
  ];

  const jobIds = [];
  for (const j of jobsData) {
    const [found] = await conn.query("SELECT job_id FROM jobs WHERE title = ? AND company_id = ?", [j.title, j.company_id]);
    if (found.length === 0) {
      const [res] = await conn.query(
        "INSERT INTO jobs (title, description, deadline, company_id, created_by) VALUES (?, ?, ?, ?, ?)",
        [j.title, j.desc, j.deadline, j.company_id, creatorId]
      );
      jobIds.push(res.insertId);
    } else {
      jobIds.push(found[0].job_id);
    }
  }
  console.log(`Seeded ${jobIds.length} jobs.`);

  // 6. Resumes CV & CV Analyses
  const targetCandidateId = candidates.length > 0 ? candidates[0].user_id : 2;
  const sampleCVs = [
    {
      fileName: "CV_Frontend_Developer.pdf",
      storagePath: "/uploads/cv/CV_Frontend_Developer.pdf",
      text: "Nguyễn Văn An - Frontend Developer. Kỹ năng: ReactJS, JavaScript ES6+, HTML5/CSS3, Git, RESTful API. Đã làm đồ án CareerAI điểm xuất sắc."
    },
    {
      fileName: "CV_Fullstack_NodeJS_React.pdf",
      storagePath: "/uploads/cv/CV_Fullstack_NodeJS_React.pdf",
      text: "Nguyễn Văn An - Fullstack Engineer. Kỹ năng: Node.js, Express, ReactJS, MySQL, Docker, JWT. Tốt nghiệp loại giỏi ngành CNTT."
    }
  ];

  const cvIds = [];
  for (const cv of sampleCVs) {
    const [found] = await conn.query("SELECT cv_id FROM resumes_cv WHERE file_name = ? AND user_id = ?", [cv.fileName, targetCandidateId]);
    if (found.length === 0) {
      const [res] = await conn.query(
        "INSERT INTO resumes_cv (file_name, storage_path, extracted_text, user_id) VALUES (?, ?, ?, ?)",
        [cv.fileName, cv.storagePath, cv.text, targetCandidateId]
      );
      cvIds.push(res.insertId);
    } else {
      cvIds.push(found[0].cv_id);
    }
  }

  // 7. Seed CV Analyses
  const sampleAnalyses = [
    {
      cvId: cvIds[0] || null,
      userId: targetCandidateId,
      fileName: "CV_Frontend_Developer.pdf",
      score: 88.5,
      summary: "CV trình bày rõ ràng, kỹ năng ReactJS và tư duy UI/UX rất tốt. Phù hợp các vị trí Frontend Junior/Mid-level.",
      strengths: ["Nắm chắc kiến trúc React Component và Hooks", "Có kinh nghiệm tích hợp RESTful API thực tế", "Trình bày cấu trúc CV mạch lạc, chuyên nghiệp"],
      improvements: ["Cần bổ sung thêm các dự án có triển khai TypeScript", "Thêm chứng chỉ tiếng Anh (TOEIC/IELTS) nếu có"],
      suggestions: ["Học thêm Redux Toolkit hoặc Zustand để quản lý State lớn", "Đưa link GitHub và demo các dự án lên đầu CV"],
      roles: ["ReactJS Developer", "Frontend Engineer", "Web UI Developer"]
    },
    {
      cvId: cvIds[1] || null,
      userId: targetCandidateId,
      fileName: "CV_Fullstack_NodeJS_React.pdf",
      score: 92.0,
      summary: "Ứng viên có nền tảng vững vàng cả Frontend lẫn Backend, kỹ năng cơ sở dữ liệu MySQL và bảo mật tốt.",
      strengths: ["Hiểu sâu kiến trúc Express và MySQL Indexing", "Có kinh nghiệm kết nối Gemini AI API", "Kỹ năng làm việc nhóm Agile/Scrum tốt"],
      improvements: ["Nên bổ sung Unit Testing (Jest, Mocha)", "Tìm hiểu thêm Docker và triển khai Cloud"],
      suggestions: ["Tối ưu thêm phần giải thích các bài toán khó đã giải quyết trong đồ án"],
      roles: ["Fullstack Developer", "Node.js Backend Engineer", "Software Engineer"]
    }
  ];

  for (const a of sampleAnalyses) {
    const resultJson = JSON.stringify({
      score: a.score,
      summary: a.summary,
      strengths: a.strengths,
      weaknesses: a.improvements,
      missingKeywords: ["Docker", "TypeScript", "Jest"],
      suggestions: a.suggestions,
      recommendedRoles: a.roles
    });

    const [found] = await conn.query("SELECT analysis_id FROM cv_analyses WHERE file_name = ? AND user_id = ?", [a.fileName, a.userId]);
    if (found.length === 0) {
      await conn.query(`
        INSERT INTO cv_analyses 
        (cv_id, user_id, file_name, score, result_json, summary, strengths_json, improvements_json, suggestions_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        a.cvId,
        a.userId,
        a.fileName,
        a.score,
        resultJson,
        a.summary,
        JSON.stringify(a.strengths),
        JSON.stringify(a.improvements),
        JSON.stringify(a.suggestions)
      ]);
    }
  }
  console.log("Seeded CV Analyses.");

  // 8. Applications & Saved Jobs
  if (jobIds.length > 0 && cvIds.length > 0) {
    await conn.query(`
      INSERT IGNORE INTO applications (user_id, job_id, cv_id, status) VALUES 
      (?, ?, ?, 'REVIEWING'),
      (?, ?, ?, 'SUBMITTED');
    `, [
      targetCandidateId, jobIds[0], cvIds[0],
      targetCandidateId, jobIds[1], cvIds[1] || cvIds[0]
    ]);

    await conn.query(`
      INSERT IGNORE INTO saved_jobs (user_id, job_id) VALUES 
      (?, ?),
      (?, ?);
    `, [
      targetCandidateId, jobIds[2],
      targetCandidateId, jobIds[3]
    ]);
  }
  console.log("Seeded Applications and Saved Jobs.");

  // 9. Notifications
  await conn.query(`
    INSERT INTO notifications (title, message, user_id, is_read) VALUES 
    ('Chào mừng đến với CareerAI', 'Hệ thống đã sẵn sàng hỗ trợ bạn phân tích CV và tìm kiếm việc làm phù hợp.', ?, 1),
    ('Kết quả phân tích CV', 'CV của bạn vừa được Gemini AI phân tích đạt 88.5/100 điểm. Hãy kiểm tra các đề xuất cải thiện!', ?, 0),
    ('Cơ hội việc làm mới', 'FPT Software vừa đăng tin tuyển dụng Lập trình viên Frontend phù hợp với hồ sơ của bạn.', ?, 0);
  `, [targetCandidateId, targetCandidateId, targetCandidateId]);

  // 10. Support requests
  await conn.query(`
    INSERT INTO support_requests (subject, content, user_id) VALUES 
    ('Hỗ trợ tải CV định dạng PDF', 'Hệ thống phân tích rất nhanh và chính xác. Cảm ơn đội ngũ phát triển CareerAI!', ?);
  `, [targetCandidateId]);

  console.log("Seeded Notifications and Support requests.");
  console.log("ALL 13 TABLES SEEDED SUCCESSFULLY!");
  await conn.end();
}

seed().catch(console.error);
