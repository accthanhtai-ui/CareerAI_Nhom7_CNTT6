import PageHeader from "../../components/common/PageHeader";

function MyCV() {
  return (
    <>
      <PageHeader
        title="Quản lý CV"
        description="Tải lên và quản lý các phiên bản CV của bạn."
      />

      <section className="content-panel">
        <h2>Danh sách CV</h2>
        <p>Chức năng tải CV PDF sẽ được kết nối với Backend ở task tiếp theo.</p>
      </section>
    </>
  );
}

export default MyCV;
