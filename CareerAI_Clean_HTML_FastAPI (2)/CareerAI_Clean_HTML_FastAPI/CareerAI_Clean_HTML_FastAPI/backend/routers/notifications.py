from fastapi import APIRouter,Depends
from pydantic import BaseModel
from ..database import fetch_all,execute
from ..security import get_current_user
router=APIRouter(prefix="/api",tags=["Thông báo và hỗ trợ"])
class SupportData(BaseModel): subject:str;content:str
@router.get("/notifications")
def notifications(user=Depends(get_current_user)):
 return fetch_all("SELECT notification_id,title,message,is_read,created_at FROM notifications WHERE user_id=%s ORDER BY created_at DESC",(user["id"],))
@router.post("/support")
def support(data:SupportData,user=Depends(get_current_user)):
 execute("INSERT INTO support_requests(user_id,subject,content) VALUES(%s,%s,%s)",(user["id"],data.subject[:200],data.content));return {"message":"Đã gửi yêu cầu hỗ trợ."}
