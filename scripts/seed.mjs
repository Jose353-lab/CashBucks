import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { vipLevels, spinRewards, settings } from "../drizzle/schema.js";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log("🌱 Seeding database...");

await db.insert(vipLevels).values([
  { level: 0, name: "Starter", minTasks: 0, minEarnings: 0, taskRewardMultiplier: 100, withdrawalCooldown: 14, withdrawalMinAmount: 100, badgeImage: "/images/badges/vip-0.png", benefits: JSON.stringify(["Basic task access"]) },
  { level: 1, name: "Bronze", minTasks: 10, minEarnings: 500, taskRewardMultiplier: 110, withdrawalCooldown: 10, withdrawalMinAmount: 75, badgeImage: "/images/badges/vip-1.png", benefits: JSON.stringify(["10% bonus rewards"]) },
  { level: 2, name: "Silver", minTasks: 50, minEarnings: 2500, taskRewardMultiplier: 125, withdrawalCooldown: 7, withdrawalMinAmount: 50, badgeImage: "/images/badges/vip-2.png", benefits: JSON.stringify(["25% bonus rewards"]) },
  { level: 3, name: "Gold", minTasks: 150, minEarnings: 7500, taskRewardMultiplier: 150, withdrawalCooldown: 5, withdrawalMinAmount: 50, badgeImage: "/images/badges/vip-3.png", benefits: JSON.stringify(["50% bonus rewards"]) },
  { level: 4, name: "Platinum", minTasks: 300, minEarnings: 15000, taskRewardMultiplier: 175, withdrawalCooldown: 3, withdrawalMinAmount: 50, badgeImage: "/images/badges/vip-4.png", benefits: JSON.stringify(["75% bonus rewards"]) },
  { level: 5, name: "Diamond", minTasks: 500, minEarnings: 25000, taskRewardMultiplier: 200, withdrawalCooldown: 1, withdrawalMinAmount: 50, badgeImage: "/images/badges/vip-5.png", benefits: JSON.stringify(["100% bonus rewards"]) }
]).onDuplicateKeyUpdate({ set: { level: 0 } });

await db.insert(spinRewards).values([
  { rewardType: "cb_points", rewardValue: 5, probability: 30, displayText: "5 CB Points", isActive: true },
  { rewardType: "cb_points", rewardValue: 10, probability: 25, displayText: "10 CB Points", isActive: true },
  { rewardType: "cb_points", rewardValue: 20, probability: 20, displayText: "20 CB Points", isActive: true },
  { rewardType: "cb_points", rewardValue: 50, probability: 15, displayText: "50 CB Points", isActive: true },
  { rewardType: "cb_points", rewardValue: 100, probability: 7, displayText: "100 CB Points", isActive: true }
]).onDuplicateKeyUpdate({ set: { rewardType: "cb_points" } });

await db.insert(settings).values([
  { key: "platform_name", value: "CashBucks", description: "Platform name" },
  { key: "referral_bonus", value: "5", description: "Fixed referral bonus in Ksh" }
]).onDuplicateKeyUpdate({ set: { key: "platform_name" } });

console.log("✅ Database seeded!");
await connection.end();
