const express = require("express");
const prisma = require("../lib/prisma");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "virusattack123";

/* -------------------------------------------------------
   🔒 ADMIN AUTH MIDDLEWARE
------------------------------------------------------- */
async function adminOnly(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ error: "Unauthorized" });

        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user || user.role !== "ADMIN")
            return res.status(403).json({ error: "Admins only" });

        req.user = user;
        next();
    } catch (err) {
        console.error("Admin auth error:", err);
        res.status(401).json({ error: "Invalid token" });
    }
}

/* -------------------------------------------------------
   📁 IMAGE UPLOAD
------------------------------------------------------- */
const uploadDir = path.join(__dirname, "../../uploads/products");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});
const upload = multer({ storage });

/* -------------------------------------------------------
   📊 FIXED ADMIN STATS (INCLUDES ASSIGNED)
------------------------------------------------------- */
router.get("/stats", adminOnly, async (req, res) => {
    try {
        const totalOrders = await prisma.order.count();

        const pending = await prisma.order.count({
            where: { status: { in: ["PENDING", "ASSIGNED"] } },
        });

        const delivering = await prisma.order.count({
            where: { status: { in: ["PICKED_UP"] } },
        });

        const delivered = await prisma.order.count({
            where: { status: "DELIVERED" },
        });

        const cancelled = await prisma.order.count({
            where: { status: "CANCELLED" },
        });

        const totalCustomers = await prisma.user.count({
            where: { role: "CUSTOMER" },
        });

        const totalDrivers = await prisma.user.count({
            where: { role: "DRIVER" },
        });

        res.json({
            totalOrders,
            pending,
            delivering,
            delivered,
            cancelled,
            totalCustomers,
            totalDrivers,
        });
    } catch (err) {
        console.error("STATS ERROR:", err);
        res.status(500).json({ error: "Failed to load stats" });
    }
});

/* -------------------------------------------------------
   📦 GET ALL PRODUCTS
------------------------------------------------------- */
router.get("/products", adminOnly, async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Error loading products" });
    }
});

/* -------------------------------------------------------
   ➕ ADD PRODUCT
------------------------------------------------------- */
router.post("/products", adminOnly, upload.single("image"), async (req, res) => {
    try {
        const { name_ar, price, inStock } = req.body;
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

        const product = await prisma.product.create({
            data: {
                name_ar,
                price: parseFloat(price),
                inStock: parseInt(inStock) || 0,
                imageUrl,
            },
        });

        res.json({ message: "تم إضافة المنتج بنجاح", product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "فشل إضافة المنتج" });
    }
});

/* -------------------------------------------------------
   ✏️ UPDATE PRODUCT
------------------------------------------------------- */
router.put("/products/:id", adminOnly, upload.single("image"), async (req, res) => {
    try {
        const { name_ar, price, inStock } = req.body;
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : undefined;

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: {
                name_ar,
                price: parseFloat(price),
                inStock: parseInt(inStock) || 0,
                ...(imageUrl && { imageUrl }),
            },
        });

        res.json({ message: "تم تحديث المنتج", product });
    } catch (err) {
        res.status(500).json({ error: "فشل تحديث المنتج" });
    }
});

/* -------------------------------------------------------
   🗑️ DELETE PRODUCT
------------------------------------------------------- */
router.delete("/products/:id", adminOnly, async (req, res) => {
    try {
        await prisma.product.delete({ where: { id: req.params.id } });
        res.json({ message: "تم حذف المنتج" });
    } catch (err) {
        res.status(500).json({ error: "فشل حذف المنتج" });
    }
});

/* -------------------------------------------------------
   📬 GET ALL ORDERS
------------------------------------------------------- */
router.get("/orders", adminOnly, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: true,
                customer: true,
                driver: true,
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "فشل تحميل الطلبات" });
    }
});

/* -------------------------------------------------------
   🚕 GET ALL DRIVERS
------------------------------------------------------- */
router.get("/drivers", adminOnly, async (req, res) => {
    try {
        const drivers = await prisma.user.findMany({
            where: { role: "DRIVER" },
        });

        res.json(drivers);
    } catch (err) {
        res.status(500).json({ error: "فشل تحميل السائقين" });
    }
});

/* -------------------------------------------------------
   🚚 ASSIGN DRIVER TO ORDER
------------------------------------------------------- */
router.post("/orders/:id/assign", adminOnly, async (req, res) => {
    try {
        const { driverId } = req.body;
        const orderId = req.params.id;

        if (!driverId)
            return res.status(400).json({ error: "Driver ID is required" });

        const driver = await prisma.user.findUnique({
            where: { id: driverId },
        });

        if (!driver || driver.role !== "DRIVER") {
            return res.status(400).json({ error: "Invalid driver" });
        }

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: {
                driverId,
                status: "ASSIGNED",
            },
            include: {
                customer: true,
                driver: true,
            },
        });

        res.json({
            message: "تم تعيين السائق بنجاح",
            order: updated,
        });

    } catch (err) {
        console.error("ASSIGN ERROR:", err);
        res.status(500).json({ error: "فشل تعيين السائق" });
    }
});

module.exports = router;
