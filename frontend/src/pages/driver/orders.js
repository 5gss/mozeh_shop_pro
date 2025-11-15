import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { fetchMe } from "../../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function DriverOrders() {
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

    /* -------------------------------------------------------
       1️⃣ LOAD DRIVER ACCOUNT
    ------------------------------------------------------- */
    useEffect(() => {
        const loadUser = async () => {
            try {
                const u = await fetchMe();
                if (!u) {
                    toast.error("يرجى تسجيل الدخول");
                    window.location.href = "/login";
                    return;
                }

                if (u.role !== "DRIVER") {
                    toast.error("غير مسموح لك بالدخول");
                    window.location.href = "/";
                    return;
                }

                setUser(u);
                loadOrders(u.id);
            } catch {
                toast.error("فشل التحقق من الحساب");
                window.location.href = "/login";
            }
        };

        loadUser();
    }, []);

    /* -------------------------------------------------------
       2️⃣ LOAD ORDERS ASSIGNED TO THIS DRIVER
    ------------------------------------------------------- */
    const loadOrders = async (driverId) => {
        try {
            setLoading(true);

            const res = await fetch(`${API}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const allOrders = await res.json();

            // Filter only driver orders
            const myOrders = allOrders.filter(
                (o) => o.driverId === driverId
            );

            setOrders(myOrders);
        } catch (err) {
            console.error(err);
            toast.error("فشل تحميل الطلبات");
        } finally {
            setLoading(false);
        }
    };

    /* -------------------------------------------------------
       3️⃣ MARK AS DELIVERED
    ------------------------------------------------------- */
    const markDelivered = async (orderId) => {
        try {
            const res = await fetch(
                `${API}/admin/orders/${orderId}/assign`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ driverId: user.id, status: "DELIVERED" }),
                }
            );

            if (!res.ok) throw new Error();

            toast.success("تم تسليم الطلب");
            loadOrders(user.id);
        } catch {
            toast.error("فشل تحديث حالة الطلب");
        }
    };

    /* -------------------------------------------------------
       4️⃣ UI
    ------------------------------------------------------- */
    if (loading || !user) {
        return (
            <p style={{ textAlign: "center", marginTop: "2rem" }}>
                ⏳ جار التحميل...
            </p>
        );
    }

    return (
        <div
            style={{
                padding: "1rem",
                maxWidth: "600px",
                margin: "0 auto",
                direction: "rtl",
            }}
        >
            <Toaster />

            <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
                🚚 طلبات السائق {user.name}
            </h2>

            {orders.length === 0 ? (
                <p style={{ textAlign: "center", marginTop: "2rem" }}>
                    لا توجد طلبات مخصصة لك حالياً
                </p>
            ) : (
                orders.map((o) => (
                    <div
                        key={o.id}
                        style={{
                            background: "#fff",
                            padding: "1rem",
                            marginBottom: "1rem",
                            borderRadius: "10px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        }}
                    >
                        <h3 style={{ margin: 0 }}>{o.customerName}</h3>
                        <p style={{ margin: "4px 0" }}>📞 {o.phone}</p>
                        <p style={{ margin: "4px 0" }}>📍 {o.address}</p>
                        <p style={{ margin: "4px 0" }}>
                            💰 المجموع: {o.totalPrice} ل.س
                        </p>

                        <button
                            onClick={() => markDelivered(o.id)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "10px",
                                background: "green",
                                color: "#fff",
                                border: 0,
                                borderRadius: "8px",
                                fontWeight: "700",
                                cursor: "pointer",
                            }}
                        >
                            ✔ تم التوصيل
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}
