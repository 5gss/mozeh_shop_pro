import { useState } from "react";
import Layout from "../components/Layout";
import { login } from "../../lib/api";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await login(email, password);

            // ✅ Save the JWT token returned from backend
            if (res?.token) {
                localStorage.setItem("token", res.token);
            }

            // ✅ Redirect to home (or dashboard)
            router.push("/");
        } catch (err) {
            console.error(err);
            setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
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
                        maxWidth: "400px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    <h2 style={{ textAlign: "center", margin: 0 }}>تسجيل الدخول</h2>

                    <div>
                        <label style={{ display: "block", marginBottom: ".3rem" }}>
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: "100%",
                                padding: ".6rem .8rem",
                                border: "1px solid #dee2e6",
                                borderRadius: "8px",
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: ".3rem" }}>
                            كلمة المرور
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? "جاري الدخول..." : "تسجيل الدخول"}
                    </button>

                    <div style={{ textAlign: "center", fontSize: ".9rem" }}>
                        ليس لديك حساب؟{" "}
                        <Link href="/register" style={{ color: "#0d6efd", textDecoration: "none" }}>
                            إنشاء حساب جديد
                        </Link>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
