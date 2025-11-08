import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * CashBucks Platform Database Schema
 * Complete schema for monetization platform with tasks, rewards, VIP tiers, and referrals
 */

// ============= USERS & AUTHENTICATION =============

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  phoneVerified: boolean("phoneVerified").default(false).notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "business"]).default("user").notNull(),
  vipLevel: int("vipLevel").default(0).notNull(), // VIP 0-5
  profileImage: text("profileImage"),
  referralCode: varchar("referralCode", { length: 20 }).unique(),
  referredBy: int("referredBy"), // User ID who referred this user
  twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(),
  dailyLoginStreak: int("dailyLoginStreak").default(0).notNull(),
  lastLoginDate: timestamp("lastLoginDate"),
  isActive: boolean("isActive").default(true).notNull(),
  isSuspended: boolean("isSuspended").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const loginLogs = mysqlTable("loginLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  isNewDevice: boolean("isNewDevice").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============= VIP SYSTEM =============

export const vipLevels = mysqlTable("vipLevels", {
  id: int("id").autoincrement().primaryKey(),
  level: int("level").notNull().unique(), // 0-5
  name: varchar("name", { length: 50 }).notNull(), // e.g., "Bronze", "Silver", "Gold"
  minTasks: int("minTasks").default(0).notNull(), // Minimum tasks to reach this level
  minEarnings: int("minEarnings").default(0).notNull(), // Minimum earnings (CB Points)
  taskRewardMultiplier: int("taskRewardMultiplier").default(100).notNull(), // Percentage (100 = 1x, 150 = 1.5x)
  withdrawalCooldown: int("withdrawalCooldown").default(7).notNull(), // Days between withdrawals
  withdrawalMinAmount: int("withdrawalMinAmount").default(50).notNull(), // Minimum withdrawal in Ksh
  badgeImage: text("badgeImage"),
  benefits: text("benefits"), // JSON string of benefits
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============= WALLET & TRANSACTIONS =============

export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: int("balance").default(0).notNull(), // CB Points (1 CB Point = 1 Ksh)
  totalEarned: int("totalEarned").default(0).notNull(),
  totalWithdrawn: int("totalWithdrawn").default(0).notNull(),
  totalSpent: int("totalSpent").default(0).notNull(),
  lastWithdrawalDate: timestamp("lastWithdrawalDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["task_reward", "referral_bonus", "spin_win", "withdrawal", "deposit", "admin_credit", "admin_debit"]).notNull(),
  amount: int("amount").notNull(), // Positive for credit, negative for debit
  balanceBefore: int("balanceBefore").notNull(),
  balanceAfter: int("balanceAfter").notNull(),
  description: text("description"),
  referenceId: int("referenceId"), // ID of related task, referral, etc.
  referenceType: varchar("referenceType", { length: 50 }), // "task", "referral", "spin", etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const withdrawals = mysqlTable("withdrawals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(), // M-Pesa phone number
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "rejected"]).default("pending").notNull(),
  mpesaTransactionId: varchar("mpesaTransactionId", { length: 100 }),
  adminNotes: text("adminNotes"),
  approvedBy: int("approvedBy"), // Admin user ID
  approvedAt: timestamp("approvedAt"),
  completedAt: timestamp("completedAt"),
  rejectedReason: text("rejectedReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============= TASKS SYSTEM =============

export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Linked to users table with role="business"
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessEmail: varchar("businessEmail", { length: 320 }),
  businessPhone: varchar("businessPhone", { length: 20 }),
  businessLogo: text("businessLogo"),
  businessDescription: text("businessDescription"),
  walletBalance: int("walletBalance").default(0).notNull(), // For paying task listing fees
  isVerified: boolean("isVerified").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }), // e.g., "survey", "social_media", "app_install"
  rewardAmount: int("rewardAmount").notNull(), // Base reward in CB Points
  totalSlots: int("totalSlots").default(100).notNull(), // Max number of completions
  completedSlots: int("completedSlots").default(0).notNull(),
  requiresProof: boolean("requiresProof").default(false).notNull(),
  proofInstructions: text("proofInstructions"),
  taskUrl: text("taskUrl"), // External URL for task
  taskImage: text("taskImage"),
  status: mysqlEnum("status", ["draft", "pending_approval", "active", "paused", "completed", "rejected"]).default("draft").notNull(),
  adminNotes: text("adminNotes"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const taskCompletions = mysqlTable("taskCompletions", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  userId: int("userId").notNull(),
  proofUrl: text("proofUrl"), // Screenshot or proof upload
  proofText: text("proofText"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  rewardAmount: int("rewardAmount").notNull(), // Actual reward given (may vary by VIP level)
  reviewedBy: int("reviewedBy"), // Admin user ID
  reviewedAt: timestamp("reviewedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============= REFERRAL SYSTEM =============

export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(), // User who referred
  referredId: int("referredId").notNull(), // User who was referred
  bonusAmount: int("bonusAmount").default(5).notNull(), // Fixed bonus (e.g., Ksh 5)
  bonusPaid: boolean("bonusPaid").default(false).notNull(),
  milestoneBonus: int("milestoneBonus").default(0).notNull(), // Extra bonus for milestones
  milestonePaid: boolean("milestonePaid").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============= GAMIFICATION =============

export const spinRewards = mysqlTable("spinRewards", {
  id: int("id").autoincrement().primaryKey(),
  rewardType: varchar("rewardType", { length: 50 }).notNull(), // "cb_points", "free_spin", "bonus_multiplier"
  rewardValue: int("rewardValue").notNull(), // Amount or multiplier
  probability: int("probability").notNull(), // Percentage (1-100)
  displayText: varchar("displayText", { length: 100 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const spinHistory = mysqlTable("spinHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  rewardId: int("rewardId").notNull(),
  rewardValue: int("rewardValue").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============= NOTIFICATIONS =============

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "task_available", "reward_earned", "withdrawal_processed"
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  actionUrl: text("actionUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============= SECURITY & FRAUD =============

export const fraudLogs = mysqlTable("fraudLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fraudType: varchar("fraudType", { length: 100 }).notNull(), // "multiple_accounts", "fake_completion", "bot_behavior"
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  description: text("description"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  evidenceData: text("evidenceData"), // JSON string
  actionTaken: text("actionTaken"),
  resolvedBy: int("resolvedBy"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============= SETTINGS =============

export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============= TYPE EXPORTS =============

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type VIPLevel = typeof vipLevels.$inferSelect;
export type InsertVIPLevel = typeof vipLevels.$inferInsert;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type InsertTaskCompletion = typeof taskCompletions.$inferInsert;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

export type SpinReward = typeof spinRewards.$inferSelect;
export type InsertSpinReward = typeof spinRewards.$inferInsert;

export type SpinHistory = typeof spinHistory.$inferSelect;
export type InsertSpinHistory = typeof spinHistory.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type LoginLog = typeof loginLogs.$inferSelect;
export type InsertLoginLog = typeof loginLogs.$inferInsert;

export type FraudLog = typeof fraudLogs.$inferSelect;
export type InsertFraudLog = typeof fraudLogs.$inferInsert;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
