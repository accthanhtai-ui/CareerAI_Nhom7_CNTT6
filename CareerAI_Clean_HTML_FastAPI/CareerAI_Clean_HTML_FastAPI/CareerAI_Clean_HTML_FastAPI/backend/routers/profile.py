import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..database import fetch_one,execute
from ..security import get_current_user
router=APIRouter(prefix="/api/profile",tags=["Hồ sơ"])
class ProfileData(BaseModel): name:str|None=None; phone:str|None=None; school:str|None=None; major:str|None=None; location:str|None=None; career_goal:str|None=None
@router.get("/me")
def get_profile(user=Depends(get_current_user)):
 return fetch_one("SELECT u.user_id,u.email,COALESCE(u.name,u.full_name) AS name,u.phone,u.role,cp.profile_id,cp.school,cp.major,cp.location,cp.career_goal,u.created_at FROM users u LEFT JOIN candidate_profiles cp ON u.user_id=cp.user_id WHERE u.user_id=%s",(user["id"],))
@router.put("/me")
def update_profile(data:ProfileData,user=Depends(get_current_user)):
 values=data.model_dump(exclude_unset=True); name=values.get("name"); phone=values.get("phone")
 if name is not None and not 2<=len(name.strip())<=120: raise HTTPException(400,"Họ tên phải từ 2 đến 120 ký tự.")
 if phone and not re.match(r"^(0|\+84)(3|5|7|8|9)[0-9]{8}$",phone.replace(" ","")): raise HTTPException(400,"Số điện thoại không hợp lệ.")
 execute("UPDATE users SET name=COALESCE(%s,name),full_name=COALESCE(%s,full_name),phone=%s WHERE user_id=%s",(name.strip() if name else None,name.strip() if name else None,phone,user["id"]))
 execute("INSERT INTO candidate_profiles(user_id,school,major,location,career_goal) VALUES(%s,%s,%s,%s,%s) ON DUPLICATE KEY UPDATE school=VALUES(school),major=VALUES(major),location=VALUES(location),career_goal=VALUES(career_goal)",(user["id"],values.get("school"),values.get("major"),values.get("location"),values.get("career_goal")))
 return {"message":"Cập nhật hồ sơ thành công.","profile":get_profile(user)}
@router.get("/dashboard-stats")
def dashboard_stats(user=Depends(get_current_user)):
 def count(table): return fetch_one(f"SELECT COUNT(*) AS total FROM {table} WHERE user_id=%s",(user["id"],))["total"]
 return {"myCvs":count("resumes_cv"),"savedJobs":count("saved_jobs"),"analyses":count("cv_analyses"),"applications":count("applications")}
