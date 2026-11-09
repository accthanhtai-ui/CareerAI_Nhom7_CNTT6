import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <p>Không tìm thấy trang bạn yêu cầu.</p>
      <Link to="/dashboard">Quay về trang chủ</Link>
    </main>
  );
}

export default NotFound;
