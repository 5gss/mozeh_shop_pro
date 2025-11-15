import { fetchMe } from "./api";

export async function userGuard() {
    const user = await fetchMe();
    if (!user) {
        alert("⚠️ يجب تسجيل الدخول أولاً.");
        window.location.href = "/login";
        return null;
    }
    return user;
}

export async function adminGuard() {
    const user = await fetchMe();
    if (!user) {
        alert("⚠️ يرجى تسجيل الدخول أولاً للوصول إلى لوحة التحكم.");
        window.location.href = "/login";
        return null;
    }
    if (user.role !== "ADMIN") {
        alert("🚫 غير مسموح بالوصول إلى لوحة التحكم.");
        window.location.href = "/";
        return null;
    }
    return user;
}
