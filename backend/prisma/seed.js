const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
    const adminPass = await bcrypt.hash("admin123", 10);
    const driverPass = await bcrypt.hash("driver123", 10);

    // ✅ Admin
    const admin = await prisma.user.upsert({
        where: { email: "admin@mozeh.local" },
        update: {},
        create: {
            name: "Mozeh Admin",
            email: "admin@mozeh.local",
            password: adminPass, // ✅ fixed
            role: "ADMIN",
            phone: "0999999999",
        },
    });

    // ✅ Drivers
    const driver1 = await prisma.user.upsert({
        where: { email: "driver1@mozeh.local" },
        update: {},
        create: {
            name: "Driver One",
            email: "driver1@mozeh.local",
            password: driverPass, // ✅ fixed
            role: "DRIVER",
            phone: "0991111111",
        },
    });

    const driver2 = await prisma.user.upsert({
        where: { email: "driver2@mozeh.local" },
        update: {},
        create: {
            name: "Driver Two",
            email: "driver2@mozeh.local",
            password: driverPass, // ✅ fixed
            role: "DRIVER",
            phone: "0992222222",
        },
    });

    // ✅ Products
    await prisma.product.createMany({
        data: [
            { name_ar: "كريسبي 2", price: 50, imageUrl: "/images/crispy.jpg", inStock: 30 },
            { name_ar: "كبة لبنية", price: 45, imageUrl: null, inStock: 40 },
            { name_ar: "روستيد 2 كغ", price: 55, imageUrl: null, inStock: 20 },
        ],
        skipDuplicates: true,
    });

    console.log("✅ Seed done.");
    console.log("Admin:", admin.email);
    console.log("Drivers:", driver1.email, ",", driver2.email);
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
