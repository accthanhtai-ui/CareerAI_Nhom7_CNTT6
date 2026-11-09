import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
function Login() {
 const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
 const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
 const navigate=useNavigate();
 async function handleSubmit(e){
  e.preventDefault();setError("");setLoading(true);
  try{
   const {data}=await api.post("/auth/login",{email,password});
   localStorage.setItem("careerai_token",data.token);
   localStorage.setItem("careerai_user",JSON.stringify(data.user));
   navigate(data.user.role==="ADMIN"?"/admin":"/dashboard");
  }catch(err){setError(err.response?.data?.message||"Không thể kết nối máy chủ.");}
  finally{setLoading(false);}
 }
 return <main className="auth-page"><section className="auth-card">
  <div className="auth-brand"><span className="brand-logo">C</span><b>CareerAI</b></div>
  <h1>Đăng nhập</h1><p>Đăng nhập để quản lý CV và khám phá cơ hội nghề nghiệp.</p>
  {error&&<div className="alert-error">{error}</div>}
  <form onSubmit={handleSubmit}>
   <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com"/></label>
   <label>Mật khẩu<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Nhập mật khẩu"/></label>
   <button disabled={loading}>{loading?"Đang đăng nhập...":"Đăng nhập"}</button>
  </form>
  <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
 </section></main>;
}
export default Login;
