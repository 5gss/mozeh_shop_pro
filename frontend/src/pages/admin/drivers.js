import AdminLayout from "../../components/AdminLayout";

export default function Drivers() {
    return (
        <AdminLayout active="drivers">
            <div className="topbar">
                <h1>إدارة السائقين</h1>
                <button className="btn btn-add">إضافة سائق جديد 🚗</button>
            </div>

            <div className="drivers-list">
                <p>هنا لاحقًا ستظهر قائمة السائقين + تعيين الطلبات لكل سائق.</p>
            </div>
        </AdminLayout>
    );
}
