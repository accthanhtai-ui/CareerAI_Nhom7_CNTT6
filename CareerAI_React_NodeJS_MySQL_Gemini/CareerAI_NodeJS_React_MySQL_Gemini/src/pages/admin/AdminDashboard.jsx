import {useEffect,useState} from "react";
import {Users,FileText,ShieldCheck} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";
function AdminDashboard(){
 const [stats,setStats]=useState(null);const [error,setError]=useState("");
 useEffect(()=>{api.get("/admin/overview").then(r=>setStats(r.data)).catch(e=>setError(e.response?.data?.message||"Không tải được thống kê."));},[]);
 return <><PageHeader title="Quản trị hệ thống" description="Tổng quan hoạt động của CareerAI."/>
 {error&&<div className="alert-error">{error}</div>}<section className="card-grid">
 <div className="info-card"><Users/><p>Tổng tài khoản</p><h2>{stats?.users??"—"}</h2></div>
 <div className="info-card"><FileText/><p>Lượt phân tích CV</p><h2>{stats?.analyses??"—"}</h2></div>
 <div className="info-card"><ShieldCheck/><p>Tài khoản quản trị</p><h2>{stats?.admins??"—"}</h2></div>
 </section><section className="content-panel"><h3>Quyền quản trị</h3><p>Bạn đang đăng nhập bằng tài khoản Admin. Các thống kê được lấy trực tiếp từ MySQL thông qua Backend Node.js.</p></section></>;
}
export default AdminDashboard;
