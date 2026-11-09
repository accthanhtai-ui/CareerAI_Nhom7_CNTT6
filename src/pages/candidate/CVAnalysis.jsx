import { Sparkles } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

function CVAnalysis() {
  return (
    <>
      <PageHeader
        title="Phân tích CV"
        description="Đánh giá CV và nhận gợi ý cải thiện bằng AI."
      />

      <section className="content-panel analysis-panel">
        <Sparkles size={32} />
        <h2>Phân tích CV bằng AI</h2>
        <p>
          Chức năng sẽ hoạt động sau khi Backend tích hợp Gemini API và cung
          cấp endpoint cho Frontend.
        </p>
      </section>
    </>
  );
}

export default CVAnalysis;
