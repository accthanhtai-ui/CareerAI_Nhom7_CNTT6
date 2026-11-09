import PageHeader from "../../components/common/PageHeader";

function Profile() {
  return (
    <>
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Thông tin hồ sơ ứng viên sẽ được quản lý tại đây."
      />

      <section className="content-panel">
        <h2>Thông tin cơ bản</h2>
        <p>Form cập nhật hồ sơ sẽ được triển khai trong task chức năng hồ sơ.</p>
      </section>
    </>
  );
}

export default Profile;
