from datetime import date
from fastapi import APIRouter,Depends,HTTPException,Query
from pydantic import BaseModel
from ..database import fetch_all,fetch_one,execute
from ..security import get_current_user
router=APIRouter(prefix="/api",tags=["Việc làm và ứng tuyển"])
class ApplyData(BaseModel): cv_id:int
@router.get("/jobs")
def list_jobs(search:str="",sort:str="newest",page:int=1,limit:int=12):
 where="WHERE (j.deadline IS NULL OR j.deadline >= CURDATE())";params=[]
 if search.strip():
  where+=" AND (j.title LIKE %s OR c.name LIKE %s OR j.description LIKE %s)";term="%"+search.strip()+"%";params += [term,term,term]
 order="j.created_at DESC" if sort=="newest" else "j.deadline ASC";page=max(page,1);limit=min(max(limit,1),50)
 total=fetch_one(f"SELECT COUNT(*) AS total FROM jobs j JOIN companies c ON j.company_id=c.company_id {where}",params)["total"]
 items=fetch_all(f"SELECT j.job_id,j.title,j.description,j.deadline,j.created_at,c.company_id,c.name AS company_name,c.website,c.description AS company_description FROM jobs j JOIN companies c ON j.company_id=c.company_id {where} ORDER BY {order} LIMIT %s OFFSET %s",params+[limit,(page-1)*limit])
 return {"items":items,"total":total,"page":page,"limit":limit,"pages":(total+limit-1)//limit}
@router.get("/jobs/saved/list")
def saved_jobs(user=Depends(get_current_user)):
 return fetch_all("SELECT j.job_id,j.title,j.description,j.deadline,c.name AS company_name FROM saved_jobs s JOIN jobs j ON s.job_id=j.job_id JOIN companies c ON j.company_id=c.company_id WHERE s.user_id=%s ORDER BY s.created_at DESC",(user["id"],))
@router.get("/jobs/{job_id}")
def job_detail(job_id:int):
 row=fetch_one("SELECT j.*,c.name AS company_name,c.website,c.description AS company_description FROM jobs j JOIN companies c ON j.company_id=c.company_id WHERE j.job_id=%s",(job_id,))
 if not row: raise HTTPException(404,"Không tìm thấy việc làm.")
 return row
@router.post("/jobs/{job_id}/save")
def save_job(job_id:int,user=Depends(get_current_user)):
 if not fetch_one("SELECT job_id FROM jobs WHERE job_id=%s",(job_id,)): raise HTTPException(404,"Tin tuyển dụng không tồn tại.")
 execute("INSERT IGNORE INTO saved_jobs(user_id,job_id) VALUES(%s,%s)",(user["id"],job_id));return {"message":"Đã lưu việc làm."}
@router.delete("/jobs/{job_id}/save")
def unsave_job(job_id:int,user=Depends(get_current_user)):
 execute("DELETE FROM saved_jobs WHERE user_id=%s AND job_id=%s",(user["id"],job_id));return {"message":"Đã bỏ lưu việc làm."}
@router.post("/jobs/{job_id}/apply")
def apply_job(job_id:int,data:ApplyData,user=Depends(get_current_user)):
 job=fetch_one("SELECT job_id,deadline FROM jobs WHERE job_id=%s",(job_id,))
 if not job: raise HTTPException(404,"Tin tuyển dụng không tồn tại.")
 if job["deadline"] and job["deadline"]<date.today(): raise HTTPException(400,"Tin tuyển dụng đã hết hạn.")
 if not fetch_one("SELECT cv_id FROM resumes_cv WHERE cv_id=%s AND user_id=%s",(data.cv_id,user["id"])): raise HTTPException(403,"CV không thuộc tài khoản của bạn.")
 try: execute("INSERT INTO applications(user_id,job_id,cv_id,status) VALUES(%s,%s,%s,'SUBMITTED')",(user["id"],job_id,data.cv_id))
 except Exception: raise HTTPException(409,"Bạn đã ứng tuyển công việc này.")
 return {"message":"Ứng tuyển thành công."}
@router.get("/applications")
def applications(user=Depends(get_current_user)):
 return fetch_all("SELECT a.application_id,a.status,a.applied_at,j.job_id,j.title,c.name AS company_name,r.file_name FROM applications a JOIN jobs j ON a.job_id=j.job_id JOIN companies c ON j.company_id=c.company_id JOIN resumes_cv r ON a.cv_id=r.cv_id WHERE a.user_id=%s ORDER BY a.applied_at DESC",(user["id"],))
@router.patch("/applications/{application_id}/withdraw")
def withdraw(application_id:int,user=Depends(get_current_user)):
 result=execute("UPDATE applications SET status='WITHDRAWN' WHERE application_id=%s AND user_id=%s AND status='SUBMITTED'",(application_id,user["id"]))
 if not result["affected"]: raise HTTPException(400,"Không thể rút hồ sơ này.")
 return {"message":"Đã rút hồ sơ."}
