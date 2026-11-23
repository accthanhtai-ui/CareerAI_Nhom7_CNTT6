import uuid,io
from pathlib import Path
from fastapi import APIRouter,Depends,UploadFile,File,HTTPException
from fastapi.responses import FileResponse
from pypdf import PdfReader
from ..database import fetch_all,fetch_one,execute
from ..security import get_current_user
from ..config import UPLOAD_DIR,MAX_UPLOAD_MB
router=APIRouter(prefix="/api/cvs",tags=["CV"])
@router.get("")
def list_cvs(user=Depends(get_current_user)):
 return fetch_all("SELECT cv_id,file_name,created_at,CHAR_LENGTH(extracted_text) AS text_length FROM resumes_cv WHERE user_id=%s ORDER BY cv_id DESC",(user["id"],))
@router.post("",status_code=201)
async def upload_cv(cv:UploadFile=File(...),user=Depends(get_current_user)):
 if cv.content_type!="application/pdf" or not cv.filename.lower().endswith(".pdf"): raise HTTPException(400,"Chỉ chấp nhận file PDF.")
 content=await cv.read()
 if len(content)>MAX_UPLOAD_MB*1024*1024: raise HTTPException(400,f"File vượt quá {MAX_UPLOAD_MB} MB.")
 try: extracted="\n".join(page.extract_text() or "" for page in PdfReader(io.BytesIO(content)).pages).strip()
 except Exception: raise HTTPException(422,"Không đọc được nội dung PDF.")
 stored=f"{uuid.uuid4().hex}.pdf";(UPLOAD_DIR/stored).write_bytes(content)
 result=execute("INSERT INTO resumes_cv(user_id,file_name,storage_path,extracted_text) VALUES(%s,%s,%s,%s)",(user["id"],cv.filename,stored,extracted))
 return {"message":"Tải CV thành công.","cv_id":result["id"],"file_name":cv.filename,"text_length":len(extracted)}
@router.get("/{cv_id}/download")
def download_cv(cv_id:int,preview:bool=False,user=Depends(get_current_user)):
 row=fetch_one("SELECT file_name,storage_path FROM resumes_cv WHERE cv_id=%s AND user_id=%s",(cv_id,user["id"]))
 if not row: raise HTTPException(404,"Không tìm thấy CV.")
 path=UPLOAD_DIR/Path(row["storage_path"]).name
 if not path.exists(): raise HTTPException(404,"File CV không còn tồn tại.")
 if preview:
  return FileResponse(path,media_type="application/pdf",content_disposition_type="inline")
 return FileResponse(path,filename=row["file_name"],media_type="application/pdf")
@router.delete("/{cv_id}")
def delete_cv(cv_id:int,user=Depends(get_current_user)):
 row=fetch_one("SELECT storage_path FROM resumes_cv WHERE cv_id=%s AND user_id=%s",(cv_id,user["id"]))
 if not row: raise HTTPException(404,"Không tìm thấy CV.")
 execute("DELETE FROM resumes_cv WHERE cv_id=%s AND user_id=%s",(cv_id,user["id"]))
 (UPLOAD_DIR/Path(row["storage_path"]).name).unlink(missing_ok=True)
 return {"message":"Đã xóa CV."}
