import PageHeader from "../../components/common/PageHeader";

function JobList() {
  return (
    <>
      <PageHeader
        title="Tìm kiếm việc làm"
        description="Khám phá cơ hội việc làm và thực tập phù hợp."
      />

      <section className="content-panel">
        <h2>Danh sách việc làm</h2>
        <p>Dữ liệu việc làm sẽ được tải từ Backend thông qua API.</p>
      </section>
    </>
  );
}

export default JobList;
