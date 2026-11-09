import { Router } from "express";
import multer from "multer";
import pdf from "pdf-parse/lib/pdf-parse.js";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { askGemini } from "../services/gemini.js";
const router=Router();
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>cb(null,file.mimetype==="application/pdf")});

router.post("/chat",requireAuth,async(req,res,next)=>{
  try{
    const {message,history=[]}=req.body;
    if(!message?.trim()) return res.status(400).json({message:"Bạn chưa nhập câu hỏi."});
    const context=(Array.isArray(history)?history.slice(-8):[]).map(x=>`${x.role==="assistant"?"CareerAI":"Người dùng"}: ${String(x.content||"").slice(0,1500)}`).join("\n");
    const answer=await askGemini(`Bạn là CareerAI Assistant, trợ lý tiếng Việt thân thiện chuyên về CV, tuyển dụng, phỏng vấn, học CNTT và định hướng nghề nghiệp. Trả lời rõ ràng, không bịa thông tin.\nLịch sử:\n${context}\nNgười dùng: ${message}`);
    res.json({answer});
  }catch(e){next(e);}
});

router.post("/analyze-cv",requireAuth,upload.single("cv"),async(req,res,next)=>{
  try{
    if(!req.file) return res.status(400).json({message:"Vui lòng chọn file PDF (tối đa 5MB)."});
    const parsed=await pdf(req.file.buffer);
    const cvText=(parsed.text||"").trim();
    if(cvText.length<80) return res.status(422).json({message:"Không trích xuất được nội dung. Hãy kiểm tra PDF có văn bản, không phải ảnh scan."});
    const prompt=`Bạn là chuyên gia tuyển dụng và tư vấn CV. Phân tích CV dưới đây một cách trung thực. Không tự bịa dữ liệu. Chỉ trả về JSON hợp lệ, không markdown, theo cấu trúc: {"score":0,"summary":"...","strengths":["..."],"weaknesses":["..."],"missingKeywords":["..."],"suggestions":["..."],"recommendedRoles":["..."]}. Điểm 0-100 là đánh giá tham khảo, không phải xác suất trúng tuyển.\nNội dung CV:\n${cvText.slice(0,18000)}`;
    const raw=await askGemini(prompt);
    let result;
    try{
      const clean=raw.replace(/```json|```/g,"").trim();
      result=JSON.parse(clean);
    }catch{
      result={score:null,summary:raw,strengths:[],weaknesses:[],missingKeywords:[],suggestions:[],recommendedRoles:[]};
    }
    const [saved]=await pool.query("INSERT INTO cv_analyses(user_id,file_name,score,result_json) VALUES(?,?,?,?)",[req.user.id,req.file.originalname,result.score??null,JSON.stringify(result)]);
    res.json({id:saved.insertId,fileName:req.file.originalname,result});
  }catch(e){next(e);}
});

router.get("/history",requireAuth,async(req,res,next)=>{
  try{
    const [rows]=await pool.query("SELECT id,file_name,score,created_at FROM cv_analyses WHERE user_id=? ORDER BY id DESC",[req.user.id]);
    res.json(rows);
  }catch(e){next(e);}
});
export default router;
