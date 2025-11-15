import AdminLayout from "../../components/AdminLayout";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("الرجاء تسجيل الدخول");
                window.location.href = "/login";
                return;
            }

            const res = await fetch(`${API}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to load stats");

            const data = await res.json();
            setStats(data);
        } catch (err) {
            toast.error("تعذر تحميل الإحصائيات ❌");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    if (loading || !stats) {
        return (
            <AdminLayout active="dashboard">
                <div className="loading-center">⏳ جارِ التحميل...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout active="dashboard">
            <div className="topbar">
                <h1>لوحة التحكم</h1>
                <button className="btn btn-add" onClick={loadStats}>
                    🔄 تحديث البيانات
                </button>
            </div>

            {/* MAIN DASHBOARD GRID */}
            <div className="dashboard-grid">

                <DashCard title="إجمالي الطلبات" icon="📦" color="blue" value={stats.totalOrders} />
                <DashCard title="طلبات قيد المعالجة" icon="⏳" color="yellow" value={stats.pending} />
                <DashCard title="طلبات قيد التوصيل" icon="🚚" color="orange" value={stats.delivering} />
                <DashCard title="طلبات تم توصيلها" icon="✅" color="green" value={stats.delivered} />
                <DashCard title="طلبات ملغاة" icon="❌" color="red" value={stats.cancelled} />
                <DashCard title="عدد العملاء" icon="👥" color="purple" value={stats.totalCustomers} />
                <DashCard title="عدد السائقين" icon="🚕" color="teal" value={stats.totalDrivers} />

            </div>
        </AdminLayout>
    );
}

/* -------------------------------------------------------
   📦 DASHBOARD CARD COMPONENT
------------------------------------------------------- */
function DashCard({ title, icon, color, value }) {
    return (
        <div className={`dash-card ${color}`}>
            <div className="card-header">
                <div className="title">{title}</div>
                <div className="icon">{icon}</div>
            </div>
            <div className="value">{value}</div>
        </div>
    );
}
