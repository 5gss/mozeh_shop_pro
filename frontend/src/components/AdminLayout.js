import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminLayout({ children, active = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("user") || "null");
      if (!saved) {
        alert("🚫 يرجى تسجيل الدخول أولاً للوصول إلى لوحة التحكم.");
        router.push("/login");
        return;
      }
      if (saved.role !== "ADMIN") {
        alert("⚠️ الوصول مسموح فقط للمسؤولين (ADMIN).");
        router.push("/");
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="admin-layout" dir="rtl">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Mozeh Admin</h2>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.4rem",
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        </div>

        <nav className="menu">
          <Link
            href="/admin/dashboard"
            className={active === "dashboard" ? "active" : ""}
          >
            🧭 لوحة التحكم
          </Link>
          <Link
            href="/admin/products"
            className={active === "products" ? "active" : ""}
          >
            📦 المنتجات
          </Link>
          <Link
            href="/admin/orders"
            className={active === "orders" ? "active" : ""}
          >
            🧾 الطلبات
          </Link>
          <Link
            href="/admin/drivers"
            className={active === "drivers" ? "active" : ""}
          >
            🚚 السائقين
          </Link>
          <Link
            href="/admin/settings"
            className={active === "settings" ? "active" : ""}
          >
            ⚙️ الإعدادات
          </Link>
        </nav>

        <footer className="sidebar-footer">
          <small>© 2025 Mozeh</small>
        </footer>
      </aside>

      <main className="admin-content">{children}</main>
    </div>
  );
}
