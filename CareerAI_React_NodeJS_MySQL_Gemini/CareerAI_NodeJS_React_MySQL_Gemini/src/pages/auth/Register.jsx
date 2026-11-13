import {useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import api from "../../services/api";
function Register(){
 const [name,setName]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");
 const [error,setError]=useState("");const [loading,setLoading]=useState(false);const navigate=useNavigate();
 async function submit(e){e.preventDefault();setError("");setLoading(true);try{
  await api.post("/auth/register",{name,email,password});navigate("/login");
 }catch(err){setError(err.response?.data?.message||"Đăng ký thất bại.");}finally{setLoading(false);}}
 return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><img src="/logo.png" alt="CareerAI Logo" className="auth-logo-img" /></div>
 <h1>Tạo tài khoản</h1><p>Đăng ký để bắt đầu hành trình nghề nghiệp.</p>{error&&<div className="alert-error">{error}</div>}
 <form onSubmit={submit}><label>Họ và tên<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Nguyễn Văn A"/></label>
 <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com"/></label>
 <label>Mật khẩu<input type="password" minLength="6" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự"/></label>
 <button disabled={loading}>{loading?"Đang tạo...":"Đăng ký"}</button></form><p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p></section></main>;
}
export default Register;
