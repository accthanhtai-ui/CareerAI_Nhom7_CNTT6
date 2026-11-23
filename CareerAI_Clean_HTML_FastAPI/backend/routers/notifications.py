from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..database import fetch_all, fetch_one, execute
from ..security import get_current_user

router = APIRouter(prefix="/api", tags=["Thông báo và hỗ trợ"])

class SupportData(BaseModel):
    subject: str
    content: str

class ReportData(BaseModel):
    reason: str

@router.get("/notifications")
def get_notifications(user=Depends(get_current_user)):
    return fetch_all(
        "SELECT notification_id, title, message, is_read, created_at FROM notifications WHERE user_id=%s ORDER BY created_at DESC",
        (user["id"],)
    )

@router.put("/notifications/{notification_id}/read")
def mark_notification_as_read(notification_id: int, user=Depends(get_current_user)):
    execute(
        "UPDATE notifications SET is_read=TRUE WHERE notification_id=%s AND user_id=%s",
        (notification_id, user["id"])
    )
    return {"message": "Đã đánh dấu thông báo là đã đọc."}

@router.put("/notifications/read-all")
def mark_all_notifications_as_read(user=Depends(get_current_user)):
    execute("UPDATE notifications SET is_read=TRUE WHERE user_id=%s", (user["id"],))
    return {"message": "Đã đánh dấu tất cả thông báo là đã đọc."}

@router.post("/support")
def create_support_request(data: SupportData, user=Depends(get_current_user)):
    subject = data.subject.strip()
    content = data.content.strip()
    if not subject:
        raise HTTPException(400, "Tiêu đề yêu cầu hỗ trợ không được để trống.")
    if not content:
        raise HTTPException(400, "Nội dung yêu cầu hỗ trợ không được để trống.")

    execute(
        "INSERT INTO support_requests(user_id, subject, content) VALUES (%s, %s, %s)",
        (user["id"], subject[:200], content)
    )
    return {"message": "Đã gửi yêu cầu hỗ trợ thành công."}

@router.get("/support")
def list_support_requests(user=Depends(get_current_user)):
    return fetch_all(
        "SELECT support_id, subject, content, created_at FROM support_requests WHERE user_id=%s ORDER BY created_at DESC",
        (user["id"],)
    )

@router.post("/jobs/{job_id}/report")
def report_job(job_id: int, data: ReportData, user=Depends(get_current_user)):
    reason = data.reason.strip()
    if not reason:
        raise HTTPException(400, "Vui lòng nhập lý do báo cáo tin tuyển dụng.")
    
    job = fetch_one("SELECT job_id, title FROM jobs WHERE job_id=%s", (job_id,))
    if not job:
        raise HTTPException(404, "Tin tuyển dụng không tồn tại.")
        
    execute(
        "INSERT INTO job_reports(job_id, reporter_id, reason) VALUES (%s, %s, %s)",
        (job_id, user["id"], reason)
    )
    return {"message": f"Đã gửi báo cáo cho tin '{job['title']}' thành công. Quản trị viên sẽ kiểm tra và xử lý."}
