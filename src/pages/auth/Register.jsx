import { Link } from "react-router-dom";

function Register() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Tạo tài khoản</h1>
        <p>Đăng ký tài khoản CareerAI.</p>

        <form>
          <label>
            Họ và tên
            <input type="text" placeholder="Nguyễn Văn A" />
          </label>

          <label>
            Email
            <input type="email" placeholder="email@example.com" />
          </label>

          <label>
            Mật khẩu
            <input type="password" placeholder="Nhập mật khẩu" />
          </label>

          <button type="button">Đăng ký</button>
        </form>

        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
