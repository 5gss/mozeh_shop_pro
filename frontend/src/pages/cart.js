import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function Cart() {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("cart") || "[]");
            setCart(saved);
        } catch { }
    }, []);

    const updateQty = (id, delta) => {
        const next = cart.map((i) =>
            i.productId === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
        );
        setCart(next);
        localStorage.setItem("cart", JSON.stringify(next));
        window.dispatchEvent(new Event("storage"));
    };

    const removeItem = (id) => {
        const next = cart.filter((i) => i.productId !== id);
        setCart(next);
        localStorage.setItem("cart", JSON.stringify(next));
        window.dispatchEvent(new Event("storage"));
    };

    const total = cart.reduce((a, b) => a + b.price * b.qty, 0);

    // 🛒 Empty cart state
    if (cart.length === 0)
        return (
            <Layout>
                <div
                    dir="rtl"
                    style={{
                        textAlign: "center",
                        marginTop: "3rem",
                        background: "#fff",
                        padding: "2rem",
                        borderRadius: "16px",
                        boxShadow: "0 6px 18px rgba(0,0,0,.05)",
                    }}
                >
                    🛒 السلة فارغة
                    <div style={{ marginTop: "1rem" }}>
                        <a
                            href="/"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "#0d6efd",
                                color: "#fff",
                                padding: "0.4rem 0.9rem",
                                borderRadius: "8px",
                                textDecoration: "none",
                                fontWeight: "600",
                            }}
                        >
                            ← رجوع إلى المتجر
                        </a>
                    </div>
                </div>
            </Layout>
        );

    // 🛍️ Full cart view
    return (
        <Layout>
            <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
                <h2
                    className="section-title"
                    style={{ marginBottom: "0.5rem" }}
                >
                    🛒 سلة المشتريات
                </h2>

                <a
                    href="/"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#0d6efd",
                        color: "#fff",
                        padding: "0.4rem 0.9rem",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600",
                        transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#0b5ed7")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#0d6efd")}
                >
                    ← رجوع إلى المتجر
                </a>
            </div>

            <div
                style={{
                    display: "grid",
                    gap: "1rem",
                    maxWidth: "900px",
                    margin: "0 auto",
                }}
            >
                {cart.map((item) => (
                    <div
                        key={item.productId}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#fff",
                            borderRadius: "16px",
                            padding: "0.8rem",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img
                                src={item.imageUrl || "/placeholder.png"}
                                alt={item.name_ar}
                                style={{
                                    width: "90px",
                                    height: "90px",
                                    borderRadius: "12px",
                                    objectFit: "cover",
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: "700", fontSize: "1rem" }}>
                                    {item.name_ar}
                                </div>
                                <div
                                    style={{
                                        color: "#0d6efd",
                                        fontWeight: "700",
                                        marginTop: "0.25rem",
                                    }}
                                >
                                    {item.price} ليرة
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                className="btn"
                                onClick={() => updateQty(item.productId, +1)}
                            >
                                +
                            </button>
                            <div
                                style={{
                                    background: "#f1f3f5",
                                    borderRadius: "6px",
                                    padding: "0.25rem 0.6rem",
                                    minWidth: "2rem",
                                    textAlign: "center",
                                    fontWeight: 600,
                                }}
                            >
                                {item.qty}
                            </div>
                            <button
                                className="btn"
                                onClick={() => updateQty(item.productId, -1)}
                            >
                                −
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => removeItem(item.productId)}
                                style={{
                                    color: "#dc3545",
                                    borderColor: "#dc3545",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* total + checkout */}
            <div
                dir="rtl"
                style={{
                    background: "#fff",
                    borderRadius: "16px",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
                    padding: "1rem",
                    marginTop: "1.5rem",
                    maxWidth: "900px",
                    marginInline: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                }}
            >
                <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                    الإجمالي:{" "}
                    <span style={{ color: "#0d6efd" }}>{total.toFixed(0)} ليرة</span>
                </div>
                <a
                    href="/checkout"
                    className="btn"
                    style={{
                        padding: "0.6rem 1.2rem",
                        fontWeight: "600",
                        fontSize: "1rem",
                    }}
                >
                    إتمام الشراء
                </a>
            </div>
        </Layout>
    );
}
