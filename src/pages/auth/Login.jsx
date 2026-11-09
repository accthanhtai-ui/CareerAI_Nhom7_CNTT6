import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";

function Login() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Đăng nhập CareerAI</h1>
        <p>Đăng nhập để tiếp tục sử dụng hệ thống.</p>

        <form>
          <label>
            Email
            <input type="email" placeholder="email@example.com" />
          </label>

          <label>
            Mật khẩu
            <input type="password" placeholder="Nhập mật khẩu" />
          </label>

          <button type="button">Đăng nhập</button>
        </form>

        <p>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
