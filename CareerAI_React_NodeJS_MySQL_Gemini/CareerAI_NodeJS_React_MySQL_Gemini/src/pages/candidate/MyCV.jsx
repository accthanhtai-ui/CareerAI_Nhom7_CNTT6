import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Sparkles, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

function MyCV() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ai/history")
      .then((res) => setCvs(res.data))
      .catch((err) => console.error("Lỗi tải lịch sử CV:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Quản lý CV & Lịch sử phân tích"
        description="Xem danh sách các hồ sơ CV đã phân tích và điểm số đánh giá từ AI."
      />

      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end" }}>
        <Link to="/cv-analysis" className="btn-apply" style={{ display: "inline-flex", textDecoration: "none" }}>
          <Sparkles size={16} /> Phân tích CV mới
        </Link>
      </div>

      <section className="content-panel">
        {loading ? (
          <p className="text-center">Đang tải danh sách CV từ cơ sở dữ liệu...</p>
        ) : cvs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <FileText size={48} style={{ color: "var(--primary)", margin: "0 auto 12px" }} />
            <h3>Chưa có CV nào được phân tích</h3>
            <p style={{ color: "#6b7280", margin: "8px 0 20px" }}>
              Tải lên bản CV định dạng PDF để nhận ngay đánh giá chuyên sâu từ Gemini AI.
            </p>
            <Link to="/cv-analysis" className="btn-apply" style={{ display: "inline-flex", textDecoration: "none" }}>
              <Sparkles size={16} /> Tải lên CV ngay
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {cvs.map((item) => (
              <div 
                key={item.id} 
                style={{
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ 
                    width: "42px", 
                    height: "42px", 
                    borderRadius: "10px", 
                    background: "#eff6ff", 
                    color: "var(--primary-dark)",
                    display: "grid",
                    placeItems: "center"
                  }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "15px", color: "#1f2937" }}>{item.file_name}</h4>
                    <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={12} /> Ngày nộp: {new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", color: "#6b7280", display: "block" }}>Điểm AI</span>
                    <strong style={{ fontSize: "20px", color: item.score >= 80 ? "#059669" : "#2563eb" }}>
                      {item.score ?? "Chờ xử lý"}
                      {item.score && <small style={{ fontSize: "12px", fontWeight: "normal", color: "#6b7280" }}>/100</small>}
                    </strong>
                  </div>

                  <Link 
                    to="/cv-analysis" 
                    className="secondary-btn"
                    style={{ textDecoration: "none", fontSize: "12px" }}
                  >
                    Xem chi tiết <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default MyCV;
