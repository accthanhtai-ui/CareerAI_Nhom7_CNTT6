import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// Hàm tự động kiểm tra và đảm bảo cột logo_url luôn an toàn
async function ensureLogoCol() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM companies LIKE 'logo_url'");
    if (!cols.length) {
      await pool.query("ALTER TABLE companies ADD COLUMN logo_url VARCHAR(500) NULL AFTER name");
      await pool.query("UPDATE companies SET logo_url = '/logos/fpt.png' WHERE company_id = 1");
      await pool.query("UPDATE companies SET logo_url = '/logos/viettel.png' WHERE company_id = 2");
      await pool.query("UPDATE companies SET logo_url = '/logos/vng.png' WHERE company_id = 3");
      await pool.query("UPDATE companies SET logo_url = '/logos/vinai.png' WHERE company_id = 4");
      await pool.query("UPDATE companies SET logo_url = '/logos/techcombank.png' WHERE company_id = 5");
    }
    return "c.logo_url";
  } catch (err) {
    return "NULL AS logo_url";
  }
}

// GET /api/jobs - Lấy toàn bộ danh sách việc làm kèm công ty
router.get("/", async (req, res, next) => {
  try {
    const logoField = await ensureLogoCol();
    const { search } = req.query;
    let sql = `
      SELECT 
        j.job_id, j.title, j.description, j.deadline, j.created_at,
        c.company_id, c.name AS company_name, ${logoField}, c.website, c.description AS company_description
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
    `;
    const params = [];
    if (search && search.trim()) {
      sql += ` WHERE j.title LIKE ? OR c.name LIKE ? OR j.description LIKE ?`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }
    sql += ` ORDER BY j.job_id ASC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// GET /api/jobs/:id - Chi tiết việc làm
router.get("/:id", async (req, res, next) => {
  try {
    const logoField = await ensureLogoCol();
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        j.job_id, j.title, j.description, j.deadline, j.created_at,
        c.company_id, c.name AS company_name, ${logoField}, c.website, c.description AS company_description
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      WHERE j.job_id = ?
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ message: "Không tìm thấy việc làm này." });
    }
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

export default router;
