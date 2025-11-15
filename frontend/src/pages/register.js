import { useState } from "react";
import Layout from "../components/Layout";
import { register } from "../../lib/api";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Register() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await register(form);

            // ✅ Save JWT token to localStorage
            if (res?.token) {
                localStorage.setItem("token", res.token);
            }

            // ✅ Redirect user to homepage (you can change it to /profile if you prefer)
            router.push("/");
        } catch (err) {
            console.error(err);
            setError("حدث خطأ أثناء إنشاء الحساب، تحقق من البيانات.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div
                dir="rtl"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "80vh",
                    padding: "1rem",
                }}
            >
                <form
                    onSubmit={submit}
                    style={{
                        background: "#fff",
                        borderRadius: "16px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        padding: "2rem",
                        width: "100%",
                        maxWidth: "420px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    <h2 style={{ textAlign: "center", margin: 0 }}>إنشاء حساب جديد</h2>

                    <div>
                        <label style={{ display: "block", marginBottom: ".3rem" }}>الاسم الكامل</label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            style={{
                                width: "100%",
                                padding: ".6rem .8rem",
                                border: "1px solid #dee2e6",
                                borderRadius: "8px",
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: ".3rem" }}>البريد الإلكتروني</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            style={{
                                width: "100%",
                                padding: ".6rem .8rem",
                                border: "1px solid #dee2e6",
                                borderRadius: "8px",
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: ".3rem" }}>رقم الهاتف</label>
                        <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            style={{
                                width: "100%",
                                padding: ".6rem .8rem",
                                border: "1px solid #dee2e6",
                                borderRadius: "8px",
                                textAlign: "right",
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: ".3rem" }}>كلمة المرور</label>
                        <input
                            type="password"
                            required
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            style={{
                                width: "100%",
                                padding: ".6rem .8rem",
                                border: "1px solid #dee2e6",
                                borderRadius: "8px",
                            }}
                        />
                    </div>

                    {error && (
                        <div
                            style={{
                                background: "#fde8e8",
                                color: "#b91c1c",
                                padding: ".6rem",
                                borderRadius: "8px",
                                textAlign: "center",
                                fontSize: ".9rem",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: "#0d6efd",
                            color: "#fff",
                            border: "none",
                            padding: ".7rem",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#0b5ed7")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#0d6efd")
                        }
                    >
                        {loading ? "جاري التسجيل..." : "إنشاء الحساب"}
                    </button>

                    <div style={{ textAlign: "center", fontSize: ".9rem" }}>
                        لديك حساب بالفعل؟{" "}
                        <Link href="/login" style={{ color: "#0d6efd", textDecoration: "none" }}>
                            تسجيل الدخول
                        </Link>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
