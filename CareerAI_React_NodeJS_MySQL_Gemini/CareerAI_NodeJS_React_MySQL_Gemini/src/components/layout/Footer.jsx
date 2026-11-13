import { Sparkles, Heart } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-left">
          <p className="footer-copyright">
            © {currentYear} <b>CareerAI</b> – Hệ thống Phân tích CV & Hướng nghiệp thông minh
          </p>
          <p className="footer-team">
            Đồ án tốt nghiệp / Bài tập lớn · Nhóm 7 (CNTT6)
          </p>
        </div>

        <div className="footer-right">
          <span className="footer-badge">
            <Sparkles size={13} /> Powered by Gemini AI & React
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
