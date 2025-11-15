import "../styles/globals.css";
import "../styles/admin.css";
import { useEffect, useState } from "react";
import { fetchMe } from "../../lib/api";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔄 On every app load, check if user still logged in
    useEffect(() => {
        const init = async () => {
            const u = await fetchMe();
            setUser(u);
            setLoading(false);
        };
        init();
    }, []);

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    fontSize: "1.2rem",
                    color: "#555",
                }}
            >
                ⏳ جاري التحقق من الجلسة...
            </div>
        );
    }

    return (
        <>
            {/* ✅ Toast notifications */}
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#333",
                        color: "#fff",
                        borderRadius: "10px",
                        fontSize: "0.95rem",
                        padding: "10px 16px",
                    },
                    success: {
                        iconTheme: { primary: "#4ade80", secondary: "#1a1a1a" },
                    },
                    error: {
                        iconTheme: { primary: "#ef4444", secondary: "#1a1a1a" },
                    },
                }}
            />

            {/* ✅ Pass user to every page */}
            <Component {...pageProps} user={user} setUser={setUser} />
        </>
    );
}
