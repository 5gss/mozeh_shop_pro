import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useRouter } from "next/router";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function Checkout() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const u = localStorage.getItem("user");
        if (!u) {
            setTimeout(() => {
                router.push("/login");
            }, 1200);
        } else {
            const parsed = JSON.parse(u);
            setUser(parsed);
            setName(parsed.name || "");
            setPhone(parsed.phone || "");
            setAddress(parsed.address || "");
        }

        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(savedCart);
    }, [router]);

    const total = cart.reduce((a, b) => a + b.price * b.qty, 0);

    const handleOrder = async () => {
        if (!user) {
            alert("يرجى تسجيل الدخول لإتمام الطلب");
            router.push("/login");
            return;
        }

        if (!cart.length) {
            alert("🛒 السلة فارغة!");
            return;
        }

        try {
            const res = await fetch(`${API}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    customerId: user.id,
                    customerName: name,
                    phone,
                    address,
                    notes,
                    items: cart.map((it) => ({
                        productId: it.productId,
                        qty: it.qty,
                        price: it.price,
                        name_ar: it.name_ar,
                        imageUrl: it.imageUrl || null,
                    })),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("Order failed:", err);
                alert("❌ فشل إرسال الطلب");
                return;
            }

            const data = await res.json();
            console.log("✅ Order response:", data);

            alert("✅ تم إرسال الطلب بنجاح!");
            localStorage.removeItem("cart");
            router.push("/");
        } catch (error) {
            console.error("Error sending order:", error);
            alert("⚠️ فشل الاتصال بالخادم");
        }
    };

    return (
        <Layout>
            <div
                dir="rtl"
                style={{
                    maxWidth: "900px",
                    margin: "2rem auto",
                    background: "#fff",
                    padding: "2rem",
                    borderRadius: "18px",
                    boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        fontWeight: "800",
                        marginBottom: "2rem",
                        color: "#0d6efd",
                    }}
                >
                    🚚 إتمام الشراء
                </h2>

                {/* 🛍️ Cart Summary */}
                {cart.length === 0 ? (
                    <div style={{ textAlign: "center", margin: "2rem 0" }}>
                        🛒 السلة فارغة
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                        {cart.map((item) => (
                            <div
                                key={item.productId}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "#f8f9fa",
                                    borderRadius: "12px",
                                    padding: "0.8rem 1rem",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <img
                                        src={item.imageUrl || "/placeholder.png"}
                                        alt={item.name_ar}
                                        style={{
                                            width: "70px",
                                            height: "70px",
                                            borderRadius: "10px",
                                            objectFit: "cover",
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: "600" }}>{item.name_ar}</div>
                                        <div style={{ color: "#0d6efd", fontWeight: "600" }}>
                                            {item.price} ليرة × {item.qty}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontWeight: "700" }}>
                                    {(item.price * item.qty).toFixed(0)} ل.س
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 🧾 Customer Info */}
                <div style={{ marginTop: "2rem" }}>
                    <input placeholder="الاسم الكامل" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                    <input placeholder="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                    <input placeholder="العنوان التفصيلي" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />
                    <textarea
                        placeholder="ملاحظات إضافية (اختياري)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ ...inputStyle, height: "80px", resize: "none" }}
                    />
                </div>

                {/* 💰 Total */}
                <div
                    style={{
                        textAlign: "center",
                        fontWeight: "700",
                        fontSize: "1.2rem",
                        marginTop: "1rem",
                    }}
                >
                    الإجمالي:{" "}
                    <span style={{ color: "#0d6efd" }}>{total.toFixed(0)} ليرة</span>
                </div>

                {/* 📨 Submit */}
                <button
                    onClick={handleOrder}
                    style={{
                        marginTop: "1.5rem",
                        width: "100%",
                        background: "#0d6efd",
                        color: "#fff",
                        border: "none",
                        padding: "0.8rem",
                        fontSize: "1rem",
                        fontWeight: "700",
                        borderRadius: "10px",
                        cursor: "pointer",
                    }}
                >
                    🚀 إرسال الطلب
                </button>
            </div>
        </Layout>
    );
}

const inputStyle = {
    width: "100%",
    marginBottom: "0.8rem",
    padding: "0.7rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
};
