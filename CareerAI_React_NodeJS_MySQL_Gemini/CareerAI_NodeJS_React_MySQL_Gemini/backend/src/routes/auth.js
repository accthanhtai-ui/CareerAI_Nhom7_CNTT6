import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) return res.status(400).json({message:"Vui lòng nhập đủ thông tin; mật khẩu tối thiểu 6 ký tự."});
    const [found] = await pool.query("SELECT user_id AS id FROM users WHERE email=?", [email]);
    if (found.length) return res.status(409).json({message:"Email đã được sử dụng."});
    
    // BƯỚC BĂM MẬT KHẨU TRONG JAVASCRIPT:
    const hash = await bcrypt.hash(password, 10);
    console.log(`\n========================================`);
    console.log(`[AUTH REGISTER - ĐĂNG KÝ MỚI]`);
    console.log(`- Mật khẩu người dùng nhập: "${password}"`);
    console.log(`- Chuỗi băm được tạo ra trong JS: "${hash}"`);
    console.log(`- Chuỗi băm này sẽ được INSERT vào MySQL!`);
    console.log(`========================================\n`);

    const [result] = await pool.query("INSERT INTO users(full_name,name,email,password_hash,password,role) VALUES(?,?,?,?,?,'CANDIDATE')", [name,name,email.toLowerCase(),hash,hash]);
    res.status(201).json({message:"Đăng ký thành công.", user:{id:result.insertId,name,email:email.toLowerCase(),role:"CANDIDATE"}});
  } catch(e){next(e);}
});

router.post("/login", async (req,res,next)=>{
  try{
    const {email,password}=req.body;
    const [rows]=await pool.query("SELECT user_id AS id, COALESCE(name, full_name) AS name, email, COALESCE(password, password_hash) AS password, role FROM users WHERE email=?",[(email||"").toLowerCase()]);
    
    if (rows.length) {
      console.log(`\n[AUTH LOGIN - ĐĂNG NHẬP]`);
      console.log(`- Người dùng nhập mật khẩu: "${password}"`);
      console.log(`- Chuỗi hash lấy từ MySQL ra: "${rows[0].password}"`);
      const isMatch = await bcrypt.compare(password || "", rows[0].password);
      console.log(`- Kết quả so khớp bcrypt.compare(): ${isMatch ? "ĐÚNG (CHO VÀO)" : "SAI (TỪ CHỐI)"}\n`);
    }

    if(!rows.length || !(await bcrypt.compare(password||"",rows[0].password))) return res.status(401).json({message:"Email hoặc mật khẩu không đúng."});
    const u=rows[0];
    const token=jwt.sign({id:u.id,email:u.email,role:u.role,name:u.name},process.env.JWT_SECRET,{expiresIn:"12h"});
    res.json({token,user:{id:u.id,name:u.name,email:u.email,role:u.role}});
  }catch(e){next(e);}
});
export default router;
