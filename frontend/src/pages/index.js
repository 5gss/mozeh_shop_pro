import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { fetchMe } from "../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    /* ============================================================
       1️⃣ LOAD USER
    ============================================================ */
    useEffect(() => {
        const loadUser = async () => {
            try {
                const u = await fetchMe();
                if (u) setUser(u);
            } catch (err) {
                console.log("Error loading user:", err);
            }
            setLoadingUser(false);
        };

        loadUser();
    }, []);

    /* ============================================================
       2️⃣ REDIRECT BASED ON ROLE
    ============================================================ */
    useEffect(() => {
        if (loadingUser) return;

        if (!user) return; // ⬅ prevent redirect when not logged in

        if (user.role === "ADMIN") {
            router.replace("/admin/dashboard");
        } else if (user.role === "DRIVER") {
            router.replace("/driver/orders");
        }
    }, [loadingUser, user]);

    /* ============================================================
       3️⃣ LOAD PRODUCTS
    ============================================================ */
    useEffect(() => {
        fetch(`${API}/products`)
            .then((r) => r.json())
            .then(setProducts)
            .catch(() => setProducts([]));
    }, []);

    /* ============================================================
       4️⃣ ADD TO CART
    ============================================================ */
    const addToCart = (p) => {
        const saved = JSON.parse(localStorage.getItem("cart") || "[]");
        const idx = saved.findIndex((i) => i.productId === p.id);

        if (idx >= 0) saved[idx].qty += 1;
        else {
            saved.push({
                productId: p.id,
                name_ar: p.name_ar,
                price: p.price,
                imageUrl: p.imageUrl,
                qty: 1,
            });
        }

        localStorage.setItem("cart", JSON.stringify(saved));
        window.dispatchEvent(new Event("storage"));
    };

    /* ============================================================
       5️⃣ IMAGE FIX
    ============================================================ */
    const buildImageUrl = (url) => {
        if (!url) return "/placeholder.png";
        return `${API.replace("/api", "")}${url}`;
    };

    /* ============================================================
       6️⃣ LOADING / REDIRECT GUARD
    ============================================================ */
    if (loadingUser) {
        return (
            <p style={{ textAlign: "center", padding: "2rem", fontSize: "1.2rem" }}>
                جارِ التحميل...
            </p>
        );
    }

    if (user?.role === "ADMIN" || user?.role === "DRIVER") {
        return null; // stop render until redirect happens
    }

    /* ============================================================
       7️⃣ UI
    ============================================================ */
    return (
        <Layout>
            <div
                dir="rtl"
                style={{
                    padding: "2rem 1rem",
                    maxWidth: "1300px",
                    margin: "0 auto",
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        fontSize: "1.8rem",
                        fontWeight: "800",
                        marginBottom: "2rem",
                        color: "#222",
                    }}
                >
                    منتجات المتجر 🛒
                </h1>

                {user && (
                    <p
                        style={{
                            textAlign: "center",
                            fontSize: "1rem",
                            fontWeight: "600",
                            marginBottom: "1rem",
                            color: "#0d6efd",
                        }}
                    >
                        مرحباً {user.name} 👋
                    </p>
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: "1.5rem",
                    }}
                >
                    {products.length === 0 ? (
                        <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
                            لا توجد منتجات حالياً
                        </p>
                    ) : (
                        products.map((p) => (
                            <div
                                key={p.id}
                                style={{
                                    background: "#fff",
                                    borderRadius: "18px",
                                    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
                                    overflow: "hidden",
                                    transition: "all 0.25s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-6px)";
                                    e.currentTarget.style.boxShadow =
                                        "0 12px 28px rgba(0,0,0,0.12)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                        "0 8px 22px rgba(0,0,0,0.08)";
                                }}
                            >
                                <img
                                    src={buildImageUrl(p.imageUrl)}
                                    alt={p.name_ar}
                                    style={{
                                        width: "100%",
                                        height: "220px",
                                        objectFit: "cover",
                                        borderBottom: "1px solid #eee",
                                    }}
                                />

                                <div style={{ padding: "1rem" }}>
                                    <h3
                                        style={{
                                            fontWeight: "700",
                                            fontSize: "1.1rem",
                                            marginBottom: ".3rem",
                                        }}
                                    >
                                        {p.name_ar}
                                    </h3>

                                    <div
                                        style={{
                                            color: "#0d6efd",
                                            fontWeight: "700",
                                            fontSize: "1rem",
                                            marginBottom: "0.8rem",
                                        }}
                                    >
                                        {p.price} ليرة
                                    </div>

                                    <button
                                        onClick={() => addToCart(p)}
                                        style={{
                                            background: "#0d6efd",
                                            color: "#fff",
                                            borderRadius: "10px",
                                            padding: "0.6rem 1rem",
                                            width: "100%",
                                            fontWeight: "600",
                                            border: "none",
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
                                        أضف للسلة
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}
