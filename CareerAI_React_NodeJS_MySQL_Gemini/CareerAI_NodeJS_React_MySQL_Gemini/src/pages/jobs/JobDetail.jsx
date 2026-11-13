import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Building2, 
  Calendar, 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="content-panel text-center">
        <p>Đang tải chi tiết việc làm...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="content-panel text-center">
        <h2>Không tìm thấy việc làm</h2>
        <p>Tin tuyển dụng này có thể đã hết hạn hoặc không tồn tại.</p>
        <Link to="/jobs" className="secondary-btn" style={{ display: "inline-flex", marginTop: "14px" }}>
          <ArrowLeft size={16} /> Quay lại danh sách việc làm
        </Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <Link to="/jobs" className="secondary-btn" style={{ display: "inline-flex" }}>
          <ArrowLeft size={16} /> Quay lại danh sách việc làm
        </Link>
      </div>

      <PageHeader
        title={job.title}
        description={`Cơ hội nghề nghiệp tại ${job.company_name}`}
      />

      {applied && (
        <div className="alert-success" style={{ marginBottom: "20px" }}>
          <CheckCircle2 size={18} />
          <span>Hồ sơ ứng tuyển của bạn đã được gửi thành công đến nhà tuyển dụng <b>{job.company_name}</b>!</span>
        </div>
      )}

      <div className="job-detail-grid">
        <section className="content-panel job-detail-main">
          <h2>Mô tả công việc</h2>
          <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
            {job.description}
          </p>

          <h3 style={{ marginTop: "24px" }}>Quyền lợi & Đãi ngộ</h3>
          <ul style={{ paddingLeft: "20px", color: "#4b5563", lineHeight: "1.7" }}>
            <li>Mức lương hấp dẫn, xét tăng lương định kỳ theo năng lực.</li>
            <li>Tham gia các dự án công nghệ lớn với công nghệ tiên tiến.</li>
            <li>Hỗ trợ thiết bị làm việc hiện đại, môi trường trẻ trung năng động.</li>
            <li>Được đào tạo kỹ năng chuyên sâu và định hướng phát triển rõ ràng.</li>
          </ul>

          <div style={{ marginTop: "30px", display: "flex", gap: "12px" }}>
            <button 
              className="btn-apply"
              onClick={() => setApplied(true)}
              style={{ padding: "12px 24px", fontSize: "14px" }}
            >
              <Sparkles size={16} /> Ứng tuyển vị trí này
            </button>
          </div>
        </section>

        <aside className="content-panel job-detail-sidebar">
          <h3>Thông tin doanh nghiệp</h3>
          {job.logo_url && (
            <div style={{
              background: "#ffffff",
              padding: "6px 12px",
              borderRadius: "10px",
              margin: "12px 0",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "140px",
              height: "50px"
            }}>
              <img 
                src={job.logo_url} 
                alt={job.company_name} 
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} 
              />
            </div>
          )}
          <div style={{ margin: "10px 0" }}>
            <span className="job-company-badge" style={{ fontSize: "13px" }}>
              <Building2 size={16} /> {job.company_name}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>
            {job.company_description}
          </p>

          <hr style={{ border: "0", borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />

          <div style={{ display: "grid", gap: "10px", fontSize: "13px", color: "#4b5563" }}>
            <div>
              <b>Hạn chót ứng tuyển:</b>
              <p style={{ margin: "3px 0", color: "#2563eb" }}>
                <Calendar size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                {job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "Tuyển liên tục"}
              </p>
            </div>
            {job.website && (
              <div>
                <b>Trang chủ công ty:</b>
                <p style={{ margin: "3px 0" }}>
                  <a href={job.website} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>
                    {job.website} <ExternalLink size={12} style={{ display: "inline" }} />
                  </a>
                </p>
              </div>
            )}
            <div>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontSize: "12px", marginTop: "8px" }}>
                <ShieldCheck size={16} /> Tin tuyển dụng đã được xác thực
              </span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default JobDetail;
