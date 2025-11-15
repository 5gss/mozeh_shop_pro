import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add/Edit sheet
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState("add"); // add | edit
    const [editingProduct, setEditingProduct] = useState(null);

    // Delete modal
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        product: null,
    });

    const [form, setForm] = useState({
        name_ar: "",
        price: "",
        inStock: "",
        description: "",
        file: null,
        preview: null,
    });

    /* -----------------------------------------
        LOAD PRODUCTS
    ------------------------------------------ */
    const loadProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API}/admin/products`, {
                headers: { Authorization: token ? `Bearer ${token}` : "" },
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setProducts(data);
        } catch (e) {
            toast.error("فشل تحميل المنتجات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    /* -----------------------------------------
        OPEN SHEET (ADD)
    ------------------------------------------ */
    const openAddSheet = () => {
        setMode("add");
        setEditingProduct(null);
        setForm({
            name_ar: "",
            price: "",
            inStock: "",
            description: "",
            file: null,
            preview: null,
        });
        setIsOpen(true);
    };

    /* -----------------------------------------
        OPEN SHEET (EDIT)
    ------------------------------------------ */
    const openEditSheet = (p) => {
        setMode("edit");
        setEditingProduct(p);

        setForm({
            name_ar: p.name_ar || "",
            price: p.price || "",
            inStock: p.inStock || "",
            description: "",
            file: null,
            preview: p.imageUrl
                ? `${API.replace("/api", "")}${p.imageUrl}`
                : null,
        });

        setIsOpen(true);
    };

    const closeSheet = () => setIsOpen(false);

    /* -----------------------------------------
        FORM UPDATES
    ------------------------------------------ */
    const handleChange = (f, v) => {
        setForm((s) => ({ ...s, [f]: v }));
    };

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setForm({
            ...form,
            file: f,
            preview: URL.createObjectURL(f),
        });
    };

    /* -----------------------------------------
        SAVE PRODUCT (ADD/EDIT)
    ------------------------------------------ */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) return toast.error("انتهت الجلسة");

        try {
            const fd = new FormData();
            fd.append("name_ar", form.name_ar);
            fd.append("price", form.price || 0);
            fd.append("inStock", form.inStock || 0);

            if (form.file) fd.append("image", form.file);

            const url =
                mode === "add"
                    ? `${API}/admin/products`
                    : `${API}/admin/products/${editingProduct.id}`;

            const res = await fetch(url, {
                method: mode === "add" ? "POST" : "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });

            if (!res.ok) throw new Error();

            toast.success(mode === "add" ? "تمت إضافة المنتج" : "تم حفظ التعديلات");
            closeSheet();
            loadProducts();
        } catch (e) {
            toast.error("حدث خطأ أثناء الحفظ");
        }
    };

    /* -----------------------------------------
        DELETE PRODUCT (modal)
    ------------------------------------------ */
    const deleteProduct = async () => {
        const p = deleteModal.product;
        if (!p) return;

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API}/admin/products/${p.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error();

            toast.success("تم حذف المنتج");
            setDeleteModal({ open: false, product: null });
            loadProducts();
        } catch {
            toast.error("فشل حذف المنتج");
        }
    };

    /* -----------------------------------------
        RENDER
    ------------------------------------------ */
    return (
        <AdminLayout active="products">
            <div className="topbar">
                <h1>المنتجات</h1>
                <button className="btn btn-add" onClick={openAddSheet}>
                    ➕ إضافة منتج
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: "center", marginTop: "3rem" }}>
                    ⏳ جار التحميل...
                </p>
            ) : (
                <div className="products-grid">
                    {products.map((p) => (
                        <div key={p.id} className="product-card">
                            <div className="product-image-wrapper">
                                <img
                                    src={
                                        p.imageUrl
                                            ? `${API.replace("/api", "")}${p.imageUrl}`
                                            : "/placeholder.png"
                                    }
                                    alt={p.name_ar}
                                />
                            </div>

                            <div className="product-body">
                                <div className="product-name">{p.name_ar}</div>

                                <div className="product-meta">
                                    <span className="price">{p.price} ل.س</span>
                                    <span className="stock">المخزون: {p.inStock}</span>
                                </div>

                                <div className="product-actions">
                                    <button
                                        className="btn btn-edit"
                                        onClick={() => openEditSheet(p)}
                                    >
                                        تعديل
                                    </button>

                                    <button
                                        className="btn btn-delete"
                                        onClick={() =>
                                            setDeleteModal({ open: true, product: p })
                                        }
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ---------------- DELETE MODAL ---------------- */}
            {deleteModal.open && (
                <div className="modal-overlay">
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3>هل تريد حذف المنتج؟</h3>
                        <p style={{ marginTop: "10px" }}>
                            سيتم حذف{" "}
                            <strong>{deleteModal.product?.name_ar}</strong> بشكل نهائي.
                        </p>

                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() =>
                                    setDeleteModal({ open: false, product: null })
                                }
                            >
                                إلغاء
                            </button>

                            <button className="btn-danger" onClick={deleteProduct}>
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- ADD / EDIT SHEET ---------------- */}
            {isOpen && (
                <div className="sheet-overlay" onClick={closeSheet}>
                    <div
                        className="sheet sheet-right"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sheet-header">
                            <h2>{mode === "add" ? "إضافة منتج جديد" : "تعديل المنتج"}</h2>
                            <button className="sheet-close" onClick={closeSheet}>
                                ✕
                            </button>
                        </div>

                        <form className="sheet-form" onSubmit={handleSubmit}>
                            <label>
                                اسم المنتج
                                <input
                                    type="text"
                                    required
                                    value={form.name_ar}
                                    onChange={(e) => handleChange("name_ar", e.target.value)}
                                />
                            </label>

                            <label>
                                الوصف (اختياري – لن يُحفظ في قاعدة البيانات)
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) =>
                                        handleChange("description", e.target.value)
                                    }
                                />
                            </label>

                            <div className="sheet-row">
                                <label>
                                    السعر (ل.س)
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={form.price}
                                        onChange={(e) => handleChange("price", e.target.value)}
                                    />
                                </label>

                                <label>
                                    المخزون
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.inStock}
                                        onChange={(e) =>
                                            handleChange("inStock", e.target.value)
                                        }
                                    />
                                </label>
                            </div>

                            <label>
                                صورة المنتج
                                <div className="upload-box">
                                    {form.preview ? (
                                        <img src={form.preview} className="upload-preview" />
                                    ) : (
                                        <span className="upload-placeholder">
                                            اسحب الصورة هنا أو اضغط للرفع
                                        </span>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleFileChange} />
                                </div>
                            </label>

                            <button className="sheet-save" type="submit">
                                {mode === "add" ? "💾 حفظ المنتج" : "💾 حفظ التعديلات"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
