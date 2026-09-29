import { execSync } from "child_process";

console.log("🔄 Initializing Prisma database synchronization...");

try {
  execSync("npx prisma generate", { stdio: "inherit" });

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")) {
    console.log("📦 Remote DATABASE_URL detected. Synchronizing PostgreSQL tables...");
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    console.log("✅ PostgreSQL tables and indexes successfully synchronized!");
  } else {
    console.log("ℹ️ Local or dummy DATABASE_URL detected. Skipping db push.");
  }
} catch (error) {
  console.warn("⚠️ Database synchronization note:", error.message);
}
