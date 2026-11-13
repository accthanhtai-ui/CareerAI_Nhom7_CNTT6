import { Router } from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Regex kiểm tra số điện thoại Việt Nam hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84)
const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

// Middleware kiểm tra và chuẩn hóa dữ liệu đầu vào (Validation)
function validateProfileInput(req, res, next) {
  const { name, phone, school, major, location, career_goal } = req.body;

  // 1. Kiểm tra họ và tên
  if (name !== undefined) {
    const trimmedName = String(name).trim();
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({ 
        message: "Họ và tên không hợp lệ (yêu cầu từ 2 đến 100 ký tự và không được để trống)." 
      });
    }
  }

  // 2. Kiểm tra số điện thoại (nếu có cung cấp)
  if (phone !== undefined && phone !== null && String(phone).trim() !== "") {
    const cleanPhone = String(phone).trim().replace(/\s+/g, "");
    if (!VN_PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({ 
        message: "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10 chữ số, ví dụ 0901234567 hoặc +84901234567)." 
      });
    }
  }

  // 3. Kiểm tra độ dài trường học
  if (school !== undefined && school !== null && String(school).length > 180) {
    return res.status(400).json({ message: "Tên trường học tối đa 180 ký tự." });
  }

  // 4. Kiểm tra độ dài chuyên ngành
  if (major !== undefined && major !== null && String(major).length > 120) {
    return res.status(400).json({ message: "Chuyên ngành tối đa 120 ký tự." });
  }

  // 5. Kiểm tra độ dài địa điểm
  if (location !== undefined && location !== null && String(location).length > 120) {
    return res.status(400).json({ message: "Địa điểm tối đa 120 ký tự." });
  }

  // 6. Kiểm tra độ dài mục tiêu nghề nghiệp
  if (career_goal !== undefined && career_goal !== null && String(career_goal).length > 2000) {
    return res.status(400).json({ message: "Mục tiêu nghề nghiệp tối đa 2000 ký tự." });
  }

  next();
}

// ==============================================================================
// 1. API LẤY HỒ SƠ ỨNG VIÊN
// ==============================================================================

// GET /api/profile/me - Lấy thông tin hồ sơ của chính người đăng nhập
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.user_id, u.email, COALESCE(u.name, u.full_name) AS name, u.phone, u.role,
        cp.profile_id, cp.school, cp.major, cp.location, cp.career_goal, u.created_at
      FROM users u
      LEFT JOIN candidate_profiles cp ON u.user_id = cp.user_id
      WHERE u.user_id = ?
    `, [req.user.id]);

    if (!rows.length) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ người dùng." });
    }
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

// GET /api/profile/:id - Lấy thông tin hồ sơ theo ID cụ thể
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    if (!targetId || isNaN(targetId)) {
      return res.status(400).json({ message: "Mã người dùng không hợp lệ." });
    }

    const [rows] = await pool.query(`
      SELECT 
        u.user_id, u.email, COALESCE(u.name, u.full_name) AS name, u.phone, u.role,
        cp.profile_id, cp.school, cp.major, cp.location, cp.career_goal, u.created_at
      FROM users u
      LEFT JOIN candidate_profiles cp ON u.user_id = cp.user_id
      WHERE u.user_id = ?
    `, [targetId]);

    if (!rows.length) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ của ứng viên này." });
    }
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

// GET /api/profile/dashboard-stats - Thống kê số liệu trang tổng quan
router.get("/dashboard-stats", requireAuth, async (req, res, next) => {
  try {
    const [[cvs]] = await pool.query("SELECT COUNT(*) AS total FROM resumes_cv WHERE user_id = ?", [req.user.id]);
    const [[saved]] = await pool.query("SELECT COUNT(*) AS total FROM saved_jobs WHERE user_id = ?", [req.user.id]);
    const [[analyses]] = await pool.query("SELECT COUNT(*) AS total FROM cv_analyses WHERE user_id = ?", [req.user.id]);
    res.json({
      myCvs: cvs.total,
      savedJobs: saved.total,
      analyses: analyses.total
    });
  } catch (e) {
    next(e);
  }
});

// ==============================================================================
// 2. API CẬP NHẬT HỒ SƠ ỨNG VIÊN
// ==============================================================================

// Hàm dùng chung thực hiện cập nhật hồ sơ vào MySQL
async function updateProfileData(userId, data) {
  const { name, phone, school, major, location, career_goal } = data;
  const cleanPhone = phone ? String(phone).trim().replace(/\s+/g, "") : null;
  const cleanName = name ? String(name).trim() : null;

  // Cập nhật bảng users nếu có thay đổi tên hoặc số điện thoại
  if (cleanName || cleanPhone !== undefined) {
    await pool.query(
      "UPDATE users SET name = COALESCE(?, name), full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE user_id = ?",
      [cleanName, cleanName, cleanPhone, userId]
    );
  }

  // Cập nhật hoặc thêm mới vào bảng candidate_profiles
  await pool.query(`
    INSERT INTO candidate_profiles (user_id, school, major, location, career_goal)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      school = VALUES(school),
      major = VALUES(major),
      location = VALUES(location),
      career_goal = VALUES(career_goal);
  `, [
    userId, 
    school !== undefined ? (school ? String(school).trim() : null) : null,
    major !== undefined ? (major ? String(major).trim() : null) : null,
    location !== undefined ? (location ? String(location).trim() : null) : null,
    career_goal !== undefined ? (career_goal ? String(career_goal).trim() : null) : null
  ]);

  // Lấy dữ liệu mới nhất sau khi cập nhật
  const [updated] = await pool.query(`
    SELECT 
      u.user_id, u.email, COALESCE(u.name, u.full_name) AS name, u.phone, u.role,
      cp.profile_id, cp.school, cp.major, cp.location, cp.career_goal, u.updated_at
    FROM users u
    LEFT JOIN candidate_profiles cp ON u.user_id = cp.user_id
    WHERE u.user_id = ?
  `, [userId]);

  return updated[0];
}

// PUT /api/profile/me - Cập nhật hồ sơ của chính mình
router.put("/me", requireAuth, validateProfileInput, async (req, res, next) => {
  try {
    // Nếu trong body có cố tình truyền user_id khác với tài khoản đang đăng nhập
    if (req.body.user_id && Number(req.body.user_id) !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa hồ sơ của người khác."
      });
    }

    const updatedProfile = await updateProfileData(req.user.id, req.body);
    res.json({
      message: "Cập nhật hồ sơ cá nhân thành công!",
      profile: updatedProfile
    });
  } catch (e) {
    next(e);
  }
});

// PUT /api/profile/:id - Cập nhật hồ sơ theo ID (Kiểm tra quyền sở hữu tài khoản)
router.put("/:id", requireAuth, validateProfileInput, async (req, res, next) => {
  try {
    const targetUserId = Number(req.params.id);
    if (!targetUserId || isNaN(targetUserId)) {
      return res.status(400).json({ message: "Mã người dùng không hợp lệ." });
    }

    // KIỂM TRA QUYỀN SỞ HỮU: Người dùng chỉ được sửa hồ sơ của chính mình
    if (targetUserId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa hồ sơ của người khác."
      });
    }

    // Kiểm tra thêm nếu trong body có gửi kèm user_id lệch với targetUserId
    if (req.body.user_id && Number(req.body.user_id) !== targetUserId && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa hồ sơ của người khác."
      });
    }

    const updatedProfile = await updateProfileData(targetUserId, req.body);
    res.json({
      message: "Cập nhật hồ sơ ứng viên thành công!",
      profile: updatedProfile
    });
  } catch (e) {
    next(e);
  }
});

export default router;
