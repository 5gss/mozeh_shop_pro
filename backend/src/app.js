require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const app = express();

/* -------------------------------------------------------
   ⚙️ CORS FIX (FINAL)
------------------------------------------------------- */

const allowedOrigins = [
    "http://localhost:3000",
    "https://mozeh-shop-pro-hxml.vercel.app",
    "https://mozeh-shop-pro-ftzo.vercel.app",
];

// ⭐ Allow ALL Vercel preview deployments (important!)
const vercelRegex = /\.vercel\.app$/;

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow mobile apps / Postman / server-to-server
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            if (vercelRegex.test(origin)) {
                return callback(null, true);
            }

            console.log("❌ Blocked by CORS:", origin);
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* -------------------------------------------------------
   🧩 ROUTES IMPORT
------------------------------------------------------- */
const authRouter = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const driverRoutes = require("./routes/driver.routes");



app.use("/api/auth", authRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/driver", driverRoutes);


/* -------------------------------------------------------
   🛍 PRODUCTS
------------------------------------------------------- */
app.get("/api/products", async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" }
        });
        res.json(products);
    } catch (err) {
        console.error("PRODUCTS ERROR:", err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

/* -------------------------------------------------------
   📦 CREATE ORDER (Customer)
------------------------------------------------------- */
app.post("/api/orders", async (req, res) => {
    try {
        const { customerId, customerName, phone, address, notes, items } = req.body;

        if (!customerId || !customerName || !phone || !items?.length) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const totalPrice = items.reduce((a, b) => a + b.price * b.qty, 0);

        const order = await prisma.order.create({
            data: {
                customerId,
                customerName,
                phone,
                address,
                notes: notes || "",
                totalPrice,
                items: {
                    create: items.map((i) => ({
                        productId: i.productId,
                        qty: i.qty,
                        price: i.price,
                        name_ar: i.name_ar,
                        imageUrl: i.imageUrl || null
                    }))
                }
            },
            include: { items: true }
        });

        res.status(201).json(order);
    } catch (err) {
        console.error("CREATE ORDER ERROR:", err);
        res.status(500).json({ error: "Failed to create order" });
    }
});

/* -------------------------------------------------------
   🧾 CUSTOMER — MY ORDERS
------------------------------------------------------- */
app.get("/api/my/orders", async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const token = auth.split(" ")[1];
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "virusattack123"
        );

        const orders = await prisma.order.findMany({
            where: { customerId: decoded.id },
            orderBy: { createdAt: "desc" },
            include: { items: true }
        });

        res.json(orders);
    } catch (err) {
        console.error("MY ORDERS ERROR:", err);
        res.status(500).json({ error: "Failed to load orders" });
    }
});

/* -------------------------------------------------------
   🧠 ADMIN STATS
------------------------------------------------------- */
app.get("/api/admin/stats", async (req, res) => {
    try {
        const [
            totalOrders,
            pending,
            delivering,
            delivered,
            cancelled,
            totalCustomers
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: "PENDING" } }),
            prisma.order.count({ where: { status: "PICKED_UP" } }),
            prisma.order.count({ where: { status: "DELIVERED" } }),
            prisma.order.count({ where: { status: "CANCELLED" } }),
            prisma.user.count({ where: { role: "CUSTOMER" } })
        ]);

        res.json({
            totalOrders,
            pending,
            delivering,
            delivered,
            cancelled,
            totalCustomers
        });
    } catch (err) {
        console.error("ADMIN STATS ERROR:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

/* -------------------------------------------------------
   🚚 ADMIN — LIST & ASSIGN DRIVERS
------------------------------------------------------- */
app.get("/api/admin/orders", async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            include: { items: true, customer: true, driver: true }
        });
        res.json(orders);
    } catch (err) {
        console.error("ADMIN ORDERS ERROR:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

app.post("/api/admin/orders/:id/assign", async (req, res) => {
    try {
        const id = req.params.id;
        const { driverId } = req.body;

        const updated = await prisma.order.update({
            where: { id },
            data: { driverId, status: "ASSIGNED" },
            include: { driver: true }
        });

        res.json(updated);
    } catch (err) {
        console.error("ASSIGN DRIVER ERROR:", err);
        res.status(500).json({ error: "Failed to assign driver" });
    }
});

app.get("/api/admin/drivers", async (req, res) => {
    try {
        const drivers = await prisma.user.findMany({
            where: { role: "DRIVER" }
        });
        res.json(drivers);
    } catch (err) {
        console.error("ADMIN DRIVERS ERROR:", err);
        res.status(500).json({ error: "Failed to fetch drivers" });
    }
});

/* -------------------------------------------------------
   🚀 EXPORT EXPRESS APP
------------------------------------------------------- */
module.exports = app;
