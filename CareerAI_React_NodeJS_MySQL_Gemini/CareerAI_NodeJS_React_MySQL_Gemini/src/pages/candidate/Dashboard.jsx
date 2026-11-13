import { useState, useEffect } from "react";
import { BriefcaseBusiness, FileText, Sparkles } from "lucide-react";
import InfoCard from "../../components/common/InfoCard";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    myCvs: 0,
    savedJobs: 0,
    analyses: 0
  });

  useEffect(() => {
    api.get("/profile/dashboard-stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Lỗi tải thống kê dashboard:", err));
  }, []);

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Chào mừng bạn đến với hệ thống CareerAI."
      />

      <section className="welcome-panel">
        <div>
          <p className="eyebrow">CareerAI</p>
          <h2>Bắt đầu hành trình nghề nghiệp của bạn</h2>
          <p>
            Quản lý CV, tham khảo cơ hội việc làm và chuẩn bị hồ sơ ứng tuyển.
          </p>
        </div>
        <Sparkles size={48} />
      </section>

      <section className="card-grid">
        <InfoCard
          title="CV của tôi"
          value={stats.myCvs}
          description="Số CV đã tải lên"
        />
        <InfoCard
          title="Việc làm đã lưu"
          value={stats.savedJobs}
          description="Cơ hội đang quan tâm"
        />
        <InfoCard
          title="Lần phân tích CV"
          value={stats.analyses}
          description="Lịch sử phân tích"
        />
      </section>

      <section className="content-panel">
        <h3>Chức năng chính</h3>
        <div className="feature-list">
          <div>
            <FileText size={20} />
            <span>Quản lý hồ sơ và CV</span>
          </div>
          <div>
            <Sparkles size={20} />
            <span>Phân tích CV bằng AI</span>
          </div>
          <div>
            <BriefcaseBusiness size={20} />
            <span>Tìm kiếm việc làm và thực tập</span>
          </div>
        </div>
      </section>
    </>
  );
}

export default Dashboard;
