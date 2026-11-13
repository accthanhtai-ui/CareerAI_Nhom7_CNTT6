import { useState, useEffect } from "react";
import { UserRound, School, GraduationCap, MapPin, Target, Phone, Mail, Save, CheckCircle2, AlertCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    school: "",
    major: "",
    location: "TP. Hồ Chí Minh",
    career_goal: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    api.get("/profile/me")
      .then((res) => {
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          school: res.data.school || "",
          major: res.data.major || "",
          location: res.data.location || "TP. Hồ Chí Minh",
          career_goal: res.data.career_goal || ""
        });
      })
      .catch((err) => console.error("Lỗi tải hồ sơ:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage("");
    try {
      await api.put("/profile/me", profile);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể cập nhật hồ sơ. Vui lòng kiểm tra lại.";
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(""), 6000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="content-panel text-center">
        <p>Đang tải thông tin hồ sơ từ cơ sở dữ liệu...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Hồ sơ cá nhân & Định hướng nghề nghiệp"
        description="Thông tin hồ sơ học vấn và mục tiêu nghề nghiệp được đồng bộ từ MySQL."
      />

      {savedSuccess && (
        <div className="alert-success">
          <CheckCircle2 size={18} />
          <span>Thông tin hồ sơ của bạn đã được cập nhật thành công vào cơ sở dữ liệu!</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: "rgba(239, 68, 68, 0.15)",
          color: "#b91c1c",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          padding: "12px 16px",
          borderRadius: "10px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "14px",
          fontWeight: "500"
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Thông tin cơ bản */}
          <section className="content-panel">
            <h3><UserRound size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", color: "var(--primary)" }} /> Thông tin cơ bản</h3>
            <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
              <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
                Họ và tên
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ height: "40px", padding: "0 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
                  required
                />
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
                Email (Tài khoản)
                <input 
                  type="email" 
                  value={profile.email} 
                  disabled
                  style={{ height: "40px", padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#f9fafb", color: "#6b7280" }}
                />
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
                Số điện thoại
                <input 
                  type="tel" 
                  value={profile.phone} 
                  placeholder="0901234567"
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={{ height: "40px", padding: "0 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
                />
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
                Khu vực / Tỉnh thành
                <input 
                  type="text" 
                  value={profile.location} 
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  style={{ height: "40px", padding: "0 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
                />
              </label>
            </div>
          </section>

          {/* Học vấn & Định hướng */}
          <section className="content-panel">
            <h3><GraduationCap size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", color: "var(--primary)" }} /> Học vấn & Mục tiêu nghề nghiệp</h3>
            <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
              <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
                Trường Đại học / Cao đẳng
                <input 
                  type="text" 
                  value={profile.school} 
                  placeholder="Học viện Công nghệ Bưu chính Viễn thông..."
                  onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                  style={{ height: "40px", padding: "0 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
                />
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
                Chuyên ngành đào tạo
                <input 
                  type="text" 
                  value={profile.major} 
                  placeholder="Kỹ thuật Phần mềm, CNTT..."
                  onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                  style={{ height: "40px", padding: "0 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
                />
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
                Mục tiêu nghề nghiệp (Career Goal)
                <textarea 
                  rows={4}
                  value={profile.career_goal} 
                  placeholder="Mục tiêu trở thành Fullstack Developer..."
                  onChange={(e) => setProfile({ ...profile, career_goal: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontFamily: "inherit", fontSize: "13px", lineHeight: "1.5" }}
                />
              </label>
            </div>
          </section>
        </div>

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <button 
            type="submit" 
            disabled={saving}
            className="btn-apply"
            style={{ width: "auto", padding: "12px 28px", fontSize: "14px" }}
          >
            <Save size={16} /> {saving ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}
          </button>
        </div>
      </form>
    </>
  );
}

export default Profile;
