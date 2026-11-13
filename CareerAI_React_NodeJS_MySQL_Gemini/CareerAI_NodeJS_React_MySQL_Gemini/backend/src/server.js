import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pool from "./config/db.js";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
import jobRoutes from "./routes/jobs.js";
import profileRoutes from "./routes/profile.js";
dotenv.config();
const app=express();
app.use(cors({origin:process.env.FRONTEND_URL||"http://localhost:5173"}));
app.use(express.json({limit:"2mb"}));
app.get("/api/health", async (req, res) => {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    const [users] = await pool.query("SELECT COUNT(*) AS count FROM users");
    const [jobs] = await pool.query("SELECT COUNT(*) AS count FROM jobs");
    res.json({
      status: "connected",
      message: "🟢 CƠ SỞ DỮ LIỆU MYSQL ĐÃ LIÊN KẾT THÀNH CÔNG 100%!",
      database: "career_ai_db",
      host: "localhost:3306 (MySQL Workbench)",
      tables_count: tables.length,
      users_count: users[0].count,
      jobs_count: jobs[0].count
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Chưa kết nối được MySQL: " + err.message });
  }
});
app.use("/api/auth",authRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/jobs",jobRoutes);
app.use("/api/profile",profileRoutes);
app.use((err,req,res,next)=>{
 console.error(err);
 res.status(err.status||500).json({message:err.message||"Lỗi máy chủ."});
});
async function start(){
 try{
  await pool.query("SELECT 1");
  const [tables] = await pool.query("SHOW TABLES");
  const [usersCount] = await pool.query("SELECT COUNT(*) AS count FROM users");
  const [jobsCount] = await pool.query("SELECT COUNT(*) AS count FROM jobs");
  const email=process.env.ADMIN_EMAIL||"accthanhtai@gmail.com";
  const password=process.env.ADMIN_PASSWORD||"123456@";
  const [rows]=await pool.query("SELECT user_id AS id FROM users WHERE email=?",[email]);
  if(!rows.length){
   const hash=await bcrypt.hash(password,10);
   await pool.query("INSERT INTO users(full_name,name,email,password_hash,password,role) VALUES(?,?,?,?,?,'ADMIN')",[process.env.ADMIN_NAME||"Thanh Tai",process.env.ADMIN_NAME||"Thanh Tai",email,hash,hash]);
  }
  const port=process.env.PORT||5000;
  app.listen(port, () => {
    console.log("\n" + "=".repeat(70));
    console.log("🟢 [CƠ SỞ DỮ LIỆU ĐÃ LIÊN KẾT THÀNH CÔNG 100%]");
    console.log(`- Database đang kết nối: career_ai_db (MySQL Workbench - Local instance MySQL80)`);
    console.log(`- Host & Port: localhost:3306 | User: root`);
    console.log(`- Số bảng nhận diện trong database: ${tables.length} bảng`);
    console.log(`- Tổng số tài khoản users: ${usersCount[0].count} tài khoản`);
    console.log(`- Tổng số tin việc làm jobs: ${jobsCount[0].count} việc làm`);
    console.log(`- Backend server: http://localhost:${port}`);
    console.log("=".repeat(70) + "\n");
  });
 }catch(e){
  console.error("Không kết nối được MySQL. Kiểm tra DATABASE_URL trong backend/.env.",e.message);
  process.exit(1);
 }
}
start();
