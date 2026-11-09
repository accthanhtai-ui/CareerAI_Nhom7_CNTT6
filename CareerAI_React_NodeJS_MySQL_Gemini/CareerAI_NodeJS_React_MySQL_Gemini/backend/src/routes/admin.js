import {Router} from "express";
import pool from "../config/db.js";
import {requireAuth,requireAdmin} from "../middleware/auth.js";
const router=Router();
router.get("/overview",requireAuth,requireAdmin,async(req,res,next)=>{
 try{
  const [[users]]=await pool.query("SELECT COUNT(*) total FROM users");
  const [[cvs]]=await pool.query("SELECT COUNT(*) total FROM cv_analyses");
  const [[admins]]=await pool.query("SELECT COUNT(*) total FROM users WHERE role='ADMIN'");
  res.json({users:users.total,analyses:cvs.total,admins:admins.total});
 }catch(e){next(e);}
});
export default router;
