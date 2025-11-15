const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const prisma = require("../lib/prisma");

const router = express.Router();

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || "virusattack123";

/* -------------------------------------------------------
   🧾 REGISTER
------------------------------------------------------- */
router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ error: "الرجاء إدخال جميع البيانات المطلوبة" });

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(400).json({ error: "البريد الإلكتروني مستخدم مسبقاً" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, phone, password: hashed, role: "CUSTOMER" },
        });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "تم إنشاء الحساب بنجاح ✅",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "فشل إنشاء الحساب" });
    }
});

/* -------------------------------------------------------
   🔐 LOGIN
------------------------------------------------------- */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: "المستخدم غير موجود" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "كلمة المرور غير صحيحة" });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "تم تسجيل الدخول بنجاح ✅",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
    }
});

/* -------------------------------------------------------
   👤 WHOAMI (verify token)
------------------------------------------------------- */
router.get("/whoami", async (req, res) => {
    try {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ error: "Missing token" });

        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                avatarUrl: true,
                role: true,
            },
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ user });
    } catch (err) {
        console.error("Token verification failed:", err.message);
        res.status(401).json({ error: "Invalid or expired token" });
    }
});

/* -------------------------------------------------------
   📸 UPLOAD PROFILE IMAGE
------------------------------------------------------- */
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowed.includes(file.mimetype))
            return cb(new Error("نوع الملف غير مدعوم (PNG أو JPG فقط)"));
        cb(null, true);
    },
});

router.post("/upload-avatar", upload.single("file"), async (req, res) => {
    try {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ error: "Unauthorized" });

        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!req.file) return res.status(400).json({ error: "لم يتم رفع أي ملف" });

        const relativePath = `/uploads/${req.file.filename}`;
        const fullUrl = `${req.protocol}://${req.get("host")}${relativePath}`;

        // ✅ Remove old avatar if exists
        const existing = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (existing?.avatarUrl) {
            const oldPath = path.join(__dirname, "../../", existing.avatarUrl);
            if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => { });
        }

        // ✅ Save new avatar
        const user = await prisma.user.update({
            where: { id: decoded.id },
            data: { avatarUrl: relativePath },
        });

        res.json({
            message: "تم تحديث الصورة بنجاح ✅",
            avatarUrl: fullUrl,
            user,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "فشل رفع الصورة" });
    }
});

/* -------------------------------------------------------
   ✏️ UPDATE PROFILE INFO
------------------------------------------------------- */
router.post("/update-profile", async (req, res) => {
    try {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ error: "Unauthorized" });

        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const { name, phone, address, avatarUrl } = req.body;

        const user = await prisma.user.update({
            where: { id: decoded.id },
            data: { name, phone, address, avatarUrl },
        });

        res.json({ message: "تم تحديث الحساب بنجاح ✅", user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "فشل تحديث الحساب" });
    }
});

module.exports = router;
