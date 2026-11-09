import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import pool from "./config/db.js";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
dotenv.config();
const app=express();
app.use(cors({origin:process.env.FRONTEND_URL||"http://localhost:5173"}));
app.use(express.json({limit:"2mb"}));
app.get("/api/health",(req,res)=>res.json({status:"ok",message:"CareerAI API đang hoạt động"}));
app.use("/api/auth",authRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/admin",adminRoutes);
app.use((err,req,res,next)=>{
 console.error(err);
 res.status(err.status||500).json({message:err.message||"Lỗi máy chủ."});
});
async function start(){
 try{
  await pool.query("SELECT 1");
  const schema=fs.readFileSync(new URL("../database/schema.sql",import.meta.url),"utf8");
  for(const statement of schema.split(";").map(x=>x.trim()).filter(Boolean)) await pool.query(statement);
  const email=process.env.ADMIN_EMAIL||"accthanhtai@gmail.com";
  const password=process.env.ADMIN_PASSWORD||"123456@";
  const [rows]=await pool.query("SELECT id FROM users WHERE email=?",[email]);
  if(!rows.length){
   const hash=await bcrypt.hash(password,10);
   await pool.query("INSERT INTO users(name,email,password,role) VALUES(?,?,?,'ADMIN')",[process.env.ADMIN_NAME||"Thanh Tai",email,hash]);
   console.log("Đã tạo tài khoản Admin:",email);
  }
  const port=process.env.PORT||5000;
  app.listen(port,()=>console.log(`CareerAI Backend chạy tại http://localhost:${port}`));
 }catch(e){
  console.error("Không kết nối được MySQL. Kiểm tra backend/.env và chạy database/schema.sql trước.",e.message);
  process.exit(1);
 }
}
start();
