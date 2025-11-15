const express = require("express");
const prisma = require("../lib/prisma");
const jwt = require("jsonwebtoken");

const router = express.Router();

// same secret used everywhere
const JWT_SECRET = process.env.JWT_SECRET || "virusattack123";

/* -------------------------------------------------------
   🔐 DRIVER AUTH MIDDLEWARE
------------------------------------------------------- */
async function driverOnly(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header)
            return res.status(401).json({ error: "Unauthorized" });

        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        // ensure role is DRIVER
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user || user.role !== "DRIVER") {
            return res.status(403).json({ error: "Driver only" });
        }

        req.user = user; // attach user to request
        next();
    } catch (e) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

/* -------------------------------------------------------
   🚚 GET ORDERS ASSIGNED TO DRIVER
------------------------------------------------------- */
router.get("/orders", driverOnly, async (req, res) => {
    try {
        const driverId = req.user.id;

        const orders = await prisma.order.findMany({
            where: { driverId },
            orderBy: { createdAt: "desc" },
            include: {
                items: true,
                customer: true,
            },
        });

        res.json(orders);
    } catch (e) {
        console.error("DRIVER ORDERS ERROR:", e);
        res.status(500).json({ error: "Failed to load orders" });
    }
});

module.exports = router;
