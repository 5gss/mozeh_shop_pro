import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { fetchMe, api } from "../../lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ name: "", phone: "", address: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState([]);
    const [preview, setPreview] = useState("/placeholder.png");
    const [file, setFile] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const u = await fetchMe();
            if (!u) {
                window.location.href = "/login";
                return;
            }

            setUser(u);
            setForm({
                name: u.name || "",
                phone: u.phone || "",
                address: u.address || "",
            });

            const baseUrl =
                process.env.NEXT_PUBLIC_API?.replace(/\/$/, "") ||
                "http://localhost:4000";
            setPreview(u.avatarUrl ? `${baseUrl}${u.avatarUrl}` : "/placeholder.png");
            setLoading(false);
            await loadOrders();
        };

        const loadOrders = async () => {
            try {
                const res = await api.get("/my/orders");
                setOrders(res.data || []);
            } catch (err) {
                console.error("Failed to load orders:", err);
            }
        };

        loadUser();
    }, []);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            let imageUrl = user?.avatarUrl;

            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                const res = await api.post("/auth/upload-avatar", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                imageUrl = res.data.user?.avatarUrl || res.data.avatarUrl;
                toast.success("✅ تم رفع الصورة بنجاح");
            }

            const updateRes = await api.post("/auth/update-profile", {
                name: form.name,
                phone: form.phone,
                address: form.address,
                avatarUrl: imageUrl,
            });

            const updated = updateRes.data.user;
            localStorage.setItem("user", JSON.stringify(updated));
            setUser(updated);
            toast.success("✅ تم حفظ التغييرات بنجاح");
        } catch (err) {
            console.error(err);
            toast.error("❌ فشل حفظ التغييرات");
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return (
            <Layout>
                <div style={{ textAlign: "center", padding: "3rem", fontSize: "1.2rem" }}>
                    ⏳ جاري التحميل...
                </div>
            </Layout>
        );

    return (
        <Layout>
            <Toaster position="top-center" />
            <div dir="rtl" style={{ padding: "2rem", background: "#f9fafb", minHeight: "100vh" }}>
                {/* Profile form */}
                <form
                    onSubmit={handleSave}
                    style={{
                        background: "#fff",
                        borderRadius: "16px",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                        padding: "2rem",
                        maxWidth: "500px",
                        margin: "0 auto 2rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: "700" }}>
                        الملف الشخصي 👤
                    </h2>

                    <div style={{ textAlign: "center" }}>
                        <img
                            src={preview}
                            alt="Profile"
                            style={{
                                width: "130px",
                                height: "130px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "3px solid #e5e7eb",
                            }}
                        />
                        <div style={{ marginTop: ".6rem" }}>
                            <label
                                htmlFor="avatar"
                                style={{
                                    background: "#0d6efd",
                                    color: "#fff",
                                    borderRadius: "8px",
                                    padding: ".5rem 1rem",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                تغيير الصورة
                            </label>
                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={handleFile}
                                style={{ display: "none" }}
                            />
                        </div>
                    </div>

                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="الاسم الكامل"
                        required
                        style={inputStyle}
                    />
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="رقم الهاتف"
                        required
                        style={{ ...inputStyle, textAlign: "right" }}
                       
                    />
                    <textarea
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="العنوان التفصيلي"
                        required
                        style={{ ...inputStyle, height: "80px" }}
                    />

                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            background: "#0d6efd",
                            color: "#fff",
                            border: "none",
                            padding: ".9rem",
                            borderRadius: "10px",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        {saving ? "💾 جاري الحفظ..." : "💾 حفظ التغييرات"}
                    </button>

                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/login";
                        }}
                        className="logout-btn"
                    >
                        تسجيل الخروج 🚪
                    </button>

                </form>

                {/* My Orders Section */}
                <section
                    style={{
                        maxWidth: "700px",
                        margin: "0 auto",
                        background: "#fff",
                        borderRadius: "16px",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                        padding: "1.5rem",
                    }}
                >
                    <h2 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "1rem" }}>
                        🧾 طلباتي
                    </h2>

                    {orders.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#666" }}>لا توجد طلبات بعد.</p>
                    ) : (
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "12px",
                                        padding: "1rem",
                                        background: "#f9fafb",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <strong>الطلب رقم #{order.id.slice(-6)}</strong>
                                        <span
                                            style={{
                                                background:
                                                    order.status === "DELIVERED"
                                                        ? "#22c55e"
                                                        : order.status === "CANCELLED"
                                                            ? "#ef4444"
                                                            : "#fbbf24",
                                                color: "#fff",
                                                padding: ".3rem .6rem",
                                                borderRadius: "6px",
                                                fontSize: ".85rem",
                                            }}
                                        >
                                            {order.status?.toLowerCase() || "pending"}
                                        </span>
                                    </div>

                                    <ul style={{ listStyle: "none", padding: 0, marginTop: ".5rem" }}>
                                        {order.items.map((it, idx) => (
                                            <li key={idx} style={{ color: "#333" }}>
                                                {it.qty} × {it.name_ar}
                                            </li>
                                        ))}
                                    </ul>

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginTop: ".6rem",
                                            fontWeight: "600",
                                            color: "#111",
                                        }}
                                    >
                                        <span>الإجمالي: {order.totalPrice} ليرة</span>
                                        <small style={{ color: "#666" }}>
                                            {new Date(order.createdAt).toLocaleString("ar-SY")}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}

const inputStyle = {
    width: "100%",
    padding: ".7rem .9rem",
    border: "1px solid #dee2e6",
    borderRadius: "10px",
    fontSize: "1rem",
};
