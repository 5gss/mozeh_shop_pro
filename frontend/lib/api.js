import axios from "axios";

export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const api = axios.create({
    baseURL: API,
    withCredentials: true,
});

// 🔐 Attach JWT token automatically
api.interceptors.request.use((cfg) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
});

/* -------------------------------------------------------
   🧾 AUTH
------------------------------------------------------- */
export const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;

    if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
    }

    return res.data;
};

export const register = (data) =>
    api.post("/auth/register", data).then((r) => {
        const { token, user } = r.data;

        if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
        }

        return r.data;
    });

export const fetchMe = async () => {
    try {
        const res = await api.get("/auth/whoami");
        const user = res.data.user;

        if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
        }

        return user;
    } catch {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        return null;
    }
};

/* -------------------------------------------------------
   🛒 PRODUCTS
------------------------------------------------------- */
export const getProducts = () =>
    api.get("/products").then((r) => r.data.products || r.data);

/* -------------------------------------------------------
   📦 ORDERS
------------------------------------------------------- */
export const createOrder = (payload) =>
    api.post("/orders", payload).then((r) => r.data.order || r.data);

// ✅ FIXED — return array directly
export const getMyOrders = () =>
    api.get("/my/orders").then((r) => r.data);

export default api;
