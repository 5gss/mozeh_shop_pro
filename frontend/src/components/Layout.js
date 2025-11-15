import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMe } from "../../lib/api";

export default function Layout({ children }) {
    const [cartCount, setCartCount] = useState(0);
    const [user, setUser] = useState(null);

    /* --------------------------------------
        🛒 CART SYNC
    -------------------------------------- */
    useEffect(() => {
        const sync = () => {
            try {
                const c = JSON.parse(localStorage.getItem("cart") || "[]");
                setCartCount(c.reduce((a, b) => a + b.qty, 0));
            } catch { }
        };
        sync();
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, []);

    /* --------------------------------------
        👤 CHECK LOGIN
    -------------------------------------- */
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const u = await fetchMe();
                if (u) setUser(u);
            } catch { }
        };
        checkLogin();
    }, []);

    /* --------------------------------------
        🚪 LOGOUT
    -------------------------------------- */
    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <>
            <header className="header">
                <div className="header-inner" dir="rtl">

                    {/* LOGO */}
                    <Link
                        href="/"
                        className="brand"
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <img
                            src="/logo.png"
                            alt="Mozeh Logo"
                            style={{ width: "38px", height: "38px" }}
                        />
                        <span>Mozeh Shop</span>
                    </Link>

                    {/* SEARCH */}
                    <div className="search">
                        <input type="text" placeholder="بحث" />
                    </div>

                    {/* RIGHT ZONE (CART + WELCOME + PROFILE) */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

                        {/* CART */}
                        <Link href="/cart" className="badge" title="السلة">
                            🛒 <span>{cartCount}</span>
                        </Link>

                        {/* 👋 WELCOME MESSAGE */}
                        {user && (
                            <span
                                style={{
                                    fontWeight: "700",
                                    fontSize: "0.95rem",
                                    color: "#0d6efd",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                مرحباً {user.name}
                            </span>
                        )}

                        {/* PROFILE ICON + MENU */}
                        {user ? (
                            <div className="badge" style={{ position: "relative" }}>
                                <Link
                                    href="/profile"
                                    title="الملف الشخصي"
                                    style={{ textDecoration: "none" }}
                                >
                                    👤
                                </Link>

                                {/* DROPDOWN MENU */}
                                <div className="logout-menu">
                                    <p style={{ margin: 0, fontWeight: "600" }}>{user.name}</p>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            background: "#f44336",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "0.4rem 0.8rem",
                                            cursor: "pointer",
                                            marginTop: "6px",
                                            width: "100%",
                                        }}
                                    >
                                        تسجيل الخروج
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="badge" title="تسجيل الدخول">
                                👤
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main
                dir="rtl"
                style={{
                    background: "#f6f7fb",
                    minHeight: "100vh",
                    padding: "1rem",
                }}
            >
                <div style={{ maxWidth: "1080px", margin: "0 auto" }}>{children}</div>
            </main>

            {/* CSS */}
            <style jsx>{`
                .logout-menu {
                    position: absolute;
                    top: 120%;
                    right: 0;
                    background: #fff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border-radius: 10px;
                    padding: 0.5rem 1rem;
                    display: none;
                    z-index: 100;
                }
                .badge:hover .logout-menu {
                    display: block;
                }
            `}</style>
        </>
    );
}
    