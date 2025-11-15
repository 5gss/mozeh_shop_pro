import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import toast, { Toaster } from "react-hot-toast";
import { fetchMe } from "../../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

    /* ============================================================
       🔒 AUTH CHECK
    ============================================================ */
    useEffect(() => {
        const check = async () => {
            try {
                const user = await fetchMe();

                if (!user) {
                    toast.error("يرجى تسجيل الدخول أولاً");
                    window.location.href = "/login";
                    return;
                }

                if (user.role !== "ADMIN") {
                    toast.error("ليس لديك صلاحيات لدخول لوحة التحكم");
                    window.location.href = "/";
                    return;
                }

                // Auth OK → load data
                setAuthChecked(true);
                load();
            } catch (err) {
                toast.error("فشل التحقق من الحساب");
                console.error(err);
                window.location.href = "/login";
            }
        };

        check();
    }, []);

    /* ============================================================
       📦 LOAD ORDERS + DRIVERS
    ============================================================ */
    const load = async () => {
        if (!token) return;

        try {
            setLoading(true);

            const [ordersRes, driversRes] = await Promise.all([
                fetch(`${API}/admin/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                }).then((r) => r.json()),

                fetch(`${API}/admin/drivers`, {
                    headers: { Authorization: `Bearer ${token}` },
                }).then((r) => r.json()),
            ]);

            setOrders(ordersRes || []);
            setDrivers(driversRes || []);
        } catch (err) {
            console.error(err);
            toast.error("فشل تحميل البيانات ⚠️");
        } finally {
            setLoading(false);
        }
    };

    /* ============================================================
       🚚 ASSIGN DRIVER
    ============================================================ */
    const assignDriver = async (orderId, driverId) => {
        try {
            const res = await fetch(`${API}/admin/orders/${orderId}/assign`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ driverId }),
            });

            if (!res.ok) throw new Error("Failed");

            toast.success("تم تعيين السائق بنجاح");
            load();
        } catch {
            toast.error("فشل تعيين السائق");
        }
    };

    /* ============================================================
       ⏳ WAIT UNTIL AUTH CHECK FINISHES
    ============================================================ */
    if (!authChecked) {
        return (
            <AdminLayout active="orders">
                <Toaster />
                <p style={{ textAlign: "center", marginTop: "2rem" }}>
                    ⏳ جارِ التحقق…
                </p>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout active="orders">
            <Toaster />

            <div className="topbar">
                <h1>📦 الطلبات</h1>
                <button onClick={load} className="btn btn-add">🔄 تحديث</button>
            </div>

            {loading ? (
                <p style={{ textAlign: "center", marginTop: "2rem" }}>
                    ⏳ جار التحميل...
                </p>
            ) : (
                <OrdersTable
                    orders={orders}
                    drivers={drivers}
                    assignDriver={assignDriver}
                />
            )}
        </AdminLayout>
    );
}

/* ---------------------- TABLE COMPONENT ---------------------- */
function OrdersTable({ orders, drivers, assignDriver }) {
    if (orders.length === 0)
        return (
            <p style={{ textAlign: "center", marginTop: "2rem" }}>
                لا توجد طلبات حالياً
            </p>
        );

    return (
        <div style={{ overflowX: "auto", marginTop: "1rem" }}>
            <table style={tableStyle}>
                <thead>
                    <tr style={{ background: "#f8f9fb" }}>
                        <th style={th}>#</th>
                        <th style={th}>الزبون</th>
                        <th style={th}>الهاتف</th>
                        <th style={th}>العنوان</th>
                        <th style={th}>الحالة</th>
                        <th style={th}>الإجمالي</th>
                        <th style={th}>السائق</th>
                        <th style={th}>إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((o, i) => (
                        <tr key={o.id} style={{ borderTop: "1px solid #eee" }}>
                            <td style={td}>{i + 1}</td>
                            <td style={td}>{o.customerName}</td>
                            <td style={td}>{o.phone}</td>
                            <td style={td}>{o.address}</td>
                            <td style={td}><StatusBadge status={o.status} /></td>
                            <td style={td}>{o.totalPrice} ل.س</td>
                            <td style={td}>{o.driver?.name || "—"}</td>

                            <td style={td}>
                                <select
                                    defaultValue={o.driverId || ""}
                                    onChange={(e) => assignDriver(o.id, e.target.value)}
                                    style={selectStyle}
                                >
                                    <option value="">اختر سائقاً</option>
                                    {drivers.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ---------------------- STATUS BADGE ---------------------- */
function StatusBadge({ status }) {
    const map = {
        PENDING: { text: "قيد المعالجة", color: "#fbbf24" },
        ASSIGNED: { text: "مُسند لسائق", color: "#3b82f6" },
        PICKED_UP: { text: "قيد التوصيل", color: "#06b6d4" },
        DELIVERED: { text: "تم التوصيل", color: "#22c55e" },
        CANCELLED: { text: "ملغى", color: "#ef4444" },
    };

    const s = map[status] || { text: "غير معروف", color: "#777" };

    return (
        <span
            style={{
                background: s.color,
                color: "#fff",
                padding: ".2rem .6rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
            }}
        >
            {s.text}
        </span>
    );
}

/* ---------------------- STYLES ---------------------- */
const tableStyle = {
    width: "100%",
    background: "#fff",
    borderCollapse: "separate",
    borderSpacing: 0,
    borderRadius: "12px",
};

const th = {
    textAlign: "right",
    padding: ".75rem",
    fontWeight: "600",
    borderBottom: "1px solid #eee",
};

const td = {
    textAlign: "right",
    padding: ".6rem",
};

const selectStyle = {
    padding: ".3rem .5rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
};
