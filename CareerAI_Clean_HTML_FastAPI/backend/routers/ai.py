import io,json
from fastapi import APIRouter,Depends,UploadFile,File,HTTPException
from pydantic import BaseModel
from pypdf import PdfReader
from ..security import get_current_user
from ..database import fetch_all,execute
from ..services.ai_service import ask_gemini
from ..config import MAX_UPLOAD_MB
router=APIRouter(prefix="/api/ai",tags=["Trí tuệ nhân tạo"])
class ChatData(BaseModel): message:str; history:list[dict]=[]
@router.post("/chat")
def chat(data:ChatData,user=Depends(get_current_user)):
 if not data.message.strip(): raise HTTPException(400,"Bạn chưa nhập câu hỏi.")
 history="\n".join(f"{item.get('role','user')}: {str(item.get('content',''))[:1000]}" for item in data.history[-8:])
 answer=ask_gemini("Bạn là CareerAI Assistant, trợ lý tiếng Việt về CV, tuyển dụng, phỏng vấn, kỹ năng CNTT và định hướng nghề nghiệp. Trả lời rõ ràng, không bịa thông tin.\nLịch sử:\n"+history+"\nNgười dùng: "+data.message)
 return {"answer":answer}
@router.post("/analyze-cv")
async def analyze_cv(cv:UploadFile=File(...),user=Depends(get_current_user)):
 if cv.content_type!="application/pdf" or not cv.filename.lower().endswith(".pdf"): raise HTTPException(400,"Vui lòng chọn file PDF.")
 content=await cv.read()
 if len(content)>MAX_UPLOAD_MB*1024*1024: raise HTTPException(400,f"File vượt quá {MAX_UPLOAD_MB} MB.")
 try: text="\n".join(page.extract_text() or "" for page in PdfReader(io.BytesIO(content)).pages).strip()
 except Exception: raise HTTPException(422,"Không đọc được PDF.")
 if len(text)<80: raise HTTPException(422,"Không trích xuất được nội dung. PDF có thể là ảnh scan.")
 prompt='Phân tích CV trung thực, không tự tạo kinh nghiệm/bằng cấp. Chỉ trả JSON hợp lệ: {"score":0,"summary":"","strengths":[],"weaknesses":[],"missingKeywords":[],"suggestions":[],"recommendedRoles":[]}. Điểm 0-100 chỉ mang tính tham khảo. CV:\n'+text[:18000]
 raw=ask_gemini(prompt)
 try: result=json.loads(raw.replace("```json","").replace("```","").strip())
 except Exception: result={"score":None,"summary":raw,"strengths":[],"weaknesses":[],"missingKeywords":[],"suggestions":[],"recommendedRoles":[]}
 saved=execute("INSERT INTO cv_analyses(user_id,file_name,score,result_json,summary) VALUES(%s,%s,%s,%s,%s)",(user["id"],cv.filename,result.get("score"),json.dumps(result,ensure_ascii=False),result.get("summary")))
 return {"id":saved["id"],"fileName":cv.filename,"result":result}
@router.get("/history")
def history(user=Depends(get_current_user)):
 rows=fetch_all("SELECT analysis_id AS id,file_name,score,created_at,result_json FROM cv_analyses WHERE user_id=%s ORDER BY analysis_id DESC",(user["id"],))
 for row in rows:
  try: row["result"]=json.loads(row.pop("result_json") or "{}")
  except Exception: row["result"]={}
 return rows
