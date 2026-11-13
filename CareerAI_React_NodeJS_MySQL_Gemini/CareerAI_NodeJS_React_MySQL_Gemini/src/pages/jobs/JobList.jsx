import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BriefcaseBusiness, 
  Building2, 
  Calendar, 
  Search, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2,
  Sparkles
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedJob, setAppliedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs(searchTerm = "") {
    try {
      setLoading(true);
      const url = searchTerm ? `/jobs?search=${encodeURIComponent(searchTerm)}` : "/jobs";
      const { data } = await api.get(url);
      setJobs(data);
    } catch (err) {
      console.error("Lỗi khi tải việc làm:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchJobs(search);
  }

  function handleApply(jobTitle) {
    setAppliedJob(jobTitle);
    setTimeout(() => setAppliedJob(null), 4000);
  }

  return (
    <>
      <PageHeader
        title="Tìm kiếm việc làm & Thực tập"
        description="Khám phá các cơ hội nghề nghiệp IT hấp dẫn được đồng bộ trực tiếp từ Database."
      />

      {appliedJob && (
        <div className="alert-success">
          <CheckCircle2 size={18} />
          <span>Bạn đã gửi hồ sơ ứng tuyển thành công vị trí: <b>{appliedJob}</b>!</span>
        </div>
      )}

      {/* Search Bar */}
      <section className="content-panel job-search-panel">
        <form onSubmit={handleSearch} className="job-search-form">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm theo chức danh, công ty (FPT, Viettel, React, Node.js, AI)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="job-search-btn">
            <Search size={16} /> Tìm kiếm
          </button>
          {search && (
            <button 
              type="button" 
              className="job-clear-btn"
              onClick={() => { setSearch(""); fetchJobs(""); }}
            >
              Làm mới
            </button>
          )}
        </form>
      </section>

      {/* Job List Cards */}
      <section className="job-list-container">
        {loading ? (
          <div className="content-panel text-center">
            <p>Đang tải danh sách việc làm từ cơ sở dữ liệu...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="content-panel text-center">
            <h3>Không tìm thấy việc làm phù hợp</h3>
            <p>Vui lòng thử tìm kiếm bằng từ khóa khác.</p>
          </div>
        ) : (
          <div className="job-grid">
            {jobs.map((job) => (
              <div key={job.job_id} className="job-card">
                <div className="job-card-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <span className="job-company-badge">
                      <Building2 size={14} /> {job.company_name}
                    </span>
                    <h3 className="job-title">{job.title}</h3>
                  </div>
                  {job.logo_url && (
                    <div style={{
                      background: "#ffffff",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "115px",
                      height: "42px",
                      flexShrink: 0
                    }}>
                      <img 
                        src={job.logo_url} 
                        alt={job.company_name} 
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} 
                      />
                    </div>
                  )}
                </div>

                <p className="job-desc">{job.description}</p>

                <div className="job-meta">
                  <span className="job-deadline">
                    <Calendar size={14} /> Hạn nộp: {job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "Tuyển gấp"}
                  </span>
                  {job.website && (
                    <a 
                      href={job.website} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="job-website-link"
                    >
                      Website <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div className="job-card-actions">
                  <Link to={`/jobs/${job.job_id}`} className="btn-detail">
                    Xem chi tiết <ArrowRight size={14} />
                  </Link>
                  <button 
                    className="btn-apply"
                    onClick={() => handleApply(job.title)}
                  >
                    <Sparkles size={14} /> Ứng tuyển ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default JobList;
