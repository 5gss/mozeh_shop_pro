import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getMyOrders } from "../../lib/api";
import toast from "react-hot-toast";

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            const data = await getMyOrders();
            setOrders(data);
        } catch (err) {
            console.error("Load orders error:", err);
            toast.error("فشل تحميل الطلبات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const statusText = {
        PENDING: "قيد المعالجة",
        ASSIGNED: "مُسند لسائق",
        PICKED_UP: "قيد التوصيل",
        DELIVERED: "تم التوصيل",
        CANCELLED: "ملغى",
    };

    const statusColor = {
        PENDING: "#ffc107",
        ASSIGNED: "#0d6efd",
        PICKED_UP: "#17a2b8",
        DELIVERED: "#28a745",
        CANCELLED: "#dc3545",
    };

    return (
        <Layout>
            <div
                dir="rtl"
                style={{
                    maxWidth: "900px",
                    margin: "2rem auto",
                    padding: "1rem",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        fontSize: "1.6rem",
                        fontWeight: "700",
                        marginBottom: "1.5rem",
                    }}
                >
                    طلبــاتي 📦
                </h2>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                        ⏳ جار تحميل الطلبات...
                    </div>
                ) : orders.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "2rem",
                            background: "#fff",
                            borderRadius: "18px",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
                        }}
                    >
                        😔 لا يوجد لديك أي طلبات حالياً
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {orders.map((o) => (
                            <div
                                key={o.id}
                                style={{
                                    background: "#fff",
                                    borderRadius: "14px",
                                    padding: "1rem",
                                    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: ".7rem",
                                    }}
                                >
                                    <strong>رقم الطلب:</strong>
                                    <span>{o.id}</span>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: ".7rem",
                                    }}
                                >
                                    <strong>الحالة:</strong>
                                    <span
                                        style={{
                                            color: statusColor[o.status],
                                            fontWeight: "700",
                                        }}
                                    >
                                        {statusText[o.status]}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: ".7rem",
                                    }}
                                >
                                    <strong>الإجمالي:</strong>
                                    <span style={{ color: "#0d6efd", fontWeight: "700" }}>
                                        {o.totalPrice} ليرة
                                    </span>
                                </div>

                                <hr style={{ margin: "1rem 0" }} />

                                <div>
                                    <strong>العناصر:</strong>
                                    {o.items.map((item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                padding: ".4rem 0",
                                                borderBottom: "1px solid #f1f1f1",
                                            }}
                                        >
                                            <span>{item.name_ar}</span>
                                            <span>
                                                {item.qty} × {item.price} ل.س
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ fontSize: ".8rem", marginTop: ".8rem", color: "#666" }}>
                                    📅 {new Date(o.createdAt).toLocaleString("ar-SY")}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
