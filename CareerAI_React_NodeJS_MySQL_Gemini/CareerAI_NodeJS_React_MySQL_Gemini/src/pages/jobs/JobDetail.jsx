import { useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";

function JobDetail() {
  const { id } = useParams();

  return (
    <>
      <PageHeader
        title="Chi tiết việc làm"
        description={`Thông tin tin tuyển dụng có mã ${id}.`}
      />

      <section className="content-panel">
        <p>Chi tiết công việc sẽ được hiển thị từ API Backend.</p>
      </section>
    </>
  );
}

export default JobDetail;
