from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from ..database import fetch_one, execute
from ..security import hash_password, verify_password, create_token
router=APIRouter(prefix="/api/auth",tags=["Tài khoản"])
class RegisterData(BaseModel): name:str; email:EmailStr; password:str
class LoginData(BaseModel): email:EmailStr; password:str
@router.post("/register",status_code=201)
def register(data:RegisterData):
    name=data.name.strip(); email=data.email.lower()
    if len(name)<2 or len(data.password)<6: raise HTTPException(400,"Tên tối thiểu 2 ký tự và mật khẩu tối thiểu 6 ký tự.")
    if fetch_one("SELECT user_id FROM users WHERE email=%s",(email,)): raise HTTPException(409,"Email đã được sử dụng.")
    hashed=hash_password(data.password)
    result=execute("INSERT INTO users(full_name,name,email,password_hash,password,role) VALUES(%s,%s,%s,%s,%s,'CANDIDATE')",(name,name,email,hashed,hashed))
    return {"message":"Đăng ký thành công.","user":{"id":result["id"],"name":name,"email":email,"role":"CANDIDATE"}}
@router.post("/login")
def login(data:LoginData):
    user=fetch_one("SELECT user_id AS id,email,COALESCE(name,full_name) AS name,COALESCE(password_hash,password) AS password,role,is_active FROM users WHERE email=%s",(data.email.lower(),))
    if not user or not user["is_active"] or not verify_password(data.password,str(user["password"])): raise HTTPException(401,"Email hoặc mật khẩu không đúng.")
    return {"token":create_token(user),"user":{"id":user["id"],"name":user["name"],"email":user["email"],"role":user["role"]}}
