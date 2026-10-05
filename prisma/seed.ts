import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedDefaultSettings(shop: string = "demo-store.myshopify.com") {
  const existing = await prisma.dropClockSettings.findUnique({
    where: { shop },
  });

  if (!existing) {
    const seeded = await prisma.dropClockSettings.create({
      data: {
        shop,
        cutoffHour: 14,
        cutoffMinute: 0,
        leadDays: 2,
        workingDays: "[1,2,3,4,5]",
        blackoutDates: JSON.stringify(["2026-11-26", "2026-12-25"]),
        tagRules: JSON.stringify([
          { tag: "pre-order", leadDays: 14 },
          { tag: "freight", leadDays: 5 },
        ]),
        tagRulesJson: JSON.stringify([
          { tag: "pre-order", leadDays: 14 },
          { tag: "freight", leadDays: 5 },
        ]),
        widgetStyle: "capsule",
        presetStyle: "capsule",
        accentColor: "#008060",
        primaryColor: "#008060",
        cardBg: "#F4F6F8",
        bgColor: "#F4F6F8",
        textColor: "#202223",
        leadText: "Order within",
        sameDayText: "for same-day dispatch",
        nextDayText: "for tomorrow's dispatch",
        etaText: "Estimated Delivery:",
        marketOverrides: "{}",
        isActive: true,
      },
    });
    console.log(`[Seed] Seeded default DropClock settings for ${shop}:`, seeded.id);
    return seeded;
  }
  return existing;
}

async function main() {
  await seedDefaultSettings("demo-store.myshopify.com");
  await seedDefaultSettings("preview-store.myshopify.com");
}

main()
  .catch((e) => {
    console.warn("[Seed] Database not reachable during seeding (skipping for local/CI build):", e.message || e);
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
