from datetime import datetime, timedelta
import bcrypt
from jose import jwt, JWTError
from fastapi import Depends, Header, HTTPException
from .config import JWT_SECRET
from .database import fetch_one

ALGORITHM = "HS256"


def hash_password(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password, hashed):
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_token(user):
    payload = {
        "id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def get_current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Bạn cần đăng nhập.")
    try:
        data = jwt.decode(authorization[7:], JWT_SECRET, algorithms=[ALGORITHM])
        user = fetch_one(
            "SELECT user_id AS id,email,COALESCE(name,full_name) AS name,role,is_active FROM users WHERE user_id=%s",
            (data["id"],),
        )
        if not user or not user["is_active"]:
            raise HTTPException(401, "Tài khoản không tồn tại hoặc đã bị khóa.")
        return user
    except JWTError:
        raise HTTPException(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.")


def get_admin_user(user=Depends(get_current_user)):
    if user["role"] != "ADMIN":
        raise HTTPException(403, "Bạn không có quyền quản trị.")
    return user
