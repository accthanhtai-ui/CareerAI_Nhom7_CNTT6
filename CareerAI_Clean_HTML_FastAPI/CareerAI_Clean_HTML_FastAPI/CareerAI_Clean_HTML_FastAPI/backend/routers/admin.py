from fastapi import APIRouter,Depends,HTTPException
from ..database import fetch_all,fetch_one,execute
from ..security import get_admin_user
router=APIRouter(prefix="/api/admin",tags=["Quản trị"])
@router.get("/overview")
def overview(user=Depends(get_admin_user)):
 return {"users":fetch_one("SELECT COUNT(*) total FROM users")["total"],"analyses":fetch_one("SELECT COUNT(*) total FROM cv_analyses")["total"],"jobs":fetch_one("SELECT COUNT(*) total FROM jobs")["total"],"applications":fetch_one("SELECT COUNT(*) total FROM applications")["total"]}
@router.get("/users")
def users(user=Depends(get_admin_user)):
 return fetch_all("SELECT user_id,name,email,role,is_active,created_at FROM users ORDER BY user_id DESC LIMIT 200")
@router.patch("/users/{user_id}/toggle")
def toggle_user(user_id:int,user=Depends(get_admin_user)):
 target=fetch_one("SELECT is_active FROM users WHERE user_id=%s",(user_id,))
 if not target: raise HTTPException(404,"Không tìm thấy tài khoản.")
 execute("UPDATE users SET is_active=%s WHERE user_id=%s",(not target["is_active"],user_id));return {"message":"Đã cập nhật trạng thái tài khoản."}
